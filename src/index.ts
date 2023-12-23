import { Canister, Record, nat64, Principal, query, text, update, Void, Vec } from 'azle';

type Log = {
    account: Principal
    description: text
    amount: nat64
}

let balance: nat64 = 0n;
let logs: Log[] = [];

export default Canister({
    pay: update([Principal, nat64], Void, (addrs, amount) => {
        if(balance >= amount){
            balance -= amount;
            logs.push({
                account: addrs,
                description: "out",
                amount: amount
            })
        }else{
            throw new Error("Not enough balance")
        }
    }),

    getPaid: update([Principal, nat64], Void, (addrs, amount) => {
        balance += amount;
        logs.push({
            account: addrs,
            description: "in",
            amount: amount
        })
    }),

    getLogs: query([], Vec(Record({
        account: Principal,
        description: text,
        amount: nat64
    })), () => {
        return logs;
    }),

    getBalance: query([], nat64, () => {
        return balance;
    })
});

