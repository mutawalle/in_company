import { Canister, Record, init, ic, nat64, Principal, query, text, update, Void, Vec, Result, Err, Ok } from 'azle';

const Log = Record({
    account: Principal,
    description: text,
    amount: nat64,
});

type Log = typeof Log;

let admin: Principal;
let balance: nat64 = 0n;
let logs: Vec<Log> = [];


function isCallerAdmin(): boolean{
    return admin.toText() === ic.caller().toText()
}

export default Canister({
    init: init([], () => {
        admin = ic.caller();
    }),
    // Function to add a payment log to the canister
    pay: update([Principal, nat64], Result(Log, text), (addrs, amount) => {
        if (!isCallerAdmin()){
            return Err("Not admin")
        }
        if (amount == BigInt(0)){
            return Err("Amount has to be greater than zero")
        }
        // payment logs can only be created only if the balance is not less than the amount
        if(balance >= amount){
            balance -= amount;
            let log = {
                account: addrs,
                description: "out",
                amount: amount
            }
            logs.push(log)
            return Ok(log)
        }else{
            return Err("Not enough balance")
        }
    }),
    // Function to add an income log to the canister
    getPaid: update([Principal, nat64], Result(Log, text), (addrs, amount) => {
        if (!isCallerAdmin()){
            return Err("Not admin")
        }
        if (amount == BigInt(0)){
            return Err("Amount has to be greater than zero")
        }
        balance += amount;
        let log = {
            account: addrs,
            description: "in",
            amount: amount
        }
        logs.push(log)
        return Ok(log)
    }),

    // Function to query all logs stored in the canister
    getLogs: query([], Result(Vec(Log), text), () => {
        if (!isCallerAdmin()){
            return Err("Not admin")
        }
        return Ok(logs);
    }),
    // Function to get the balance
    getBalance: query([], Result(nat64, text), () => {
        if (!isCallerAdmin()){
            return Err("Not admin")
        }
        return Ok(balance);
    })
});

