const AddForm = () => {
    return (
        <div>
            <form>
                <div className="input-wrapper">
                    <input type="number" name="threshold" placeholder="Threshold" />
                </div>
                <div className="input-wrapper">
                    <textarea placeholder="One wallet per line" rows="8"></textarea>
                </div>

                <div className="input-wrapper">
                    <button>Create</button>
                </div>
            </form>
        </div>
    )
}

export default AddForm;