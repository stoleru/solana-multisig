import { useState } from "react";

const Multisig = ({data, account, approve, execute, create}) => {
    const [ newAccount, setNewAccount ] = useState({})
    const onCreateClick = async () => {
        await create(data, newAccount.to, newAccount.amount)
    }

    const onApproveClick = async (transactionTx) => {
        await approve(data, transactionTx)
    }

    const onExecuteClick = async (transactionTx) => {
        await execute(data, transactionTx)
    }

    return (
        <div className="multisig">
            Multisig account: <strong>{account}</strong>
            <hr />
            <div className="input-wrapper">
                <input placeholder="Amount" type="number" onChange={e => setNewAccount({...newAccount, amount: e.target.value})} />
            </div>
            <div className="input-wrapper">
                <input placeholder="To address" type="text"  onChange={e => setNewAccount({...newAccount, to: e.target.value})} />
            </div>
            <div className="input-wrapper">
                <button onClick={onCreateClick}>Send</button>
            </div>
            <hr />
            <div>
                Amount: <strong>20SOL</strong><br />
                To: <strong>DiWnPDV4tSHaGQmCyNtjP5WBRS3MGECRVk3cRwgUb2HR</strong><br />
                Status: <strong>Pending</strong><br /><br />
                <button onClick={() => onApproveClick("transaction_id_goes_here")}>Approve</button>
                &nbsp;
                <button disabled onClick={() => onExecuteClick("transaction_id_goes_here")}>Execute (1/3)</button>
            </div>
            <hr />
        </div>
    );
}

export default Multisig