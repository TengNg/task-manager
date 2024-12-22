import ModalDialog from "./ModalDialog";

const BoardsHelp = ({ open, setOpen }) => {
    return (
        <ModalDialog title={"help"} open={open} setOpen={setOpen}>
            <div className="flex flex-col h-[175px]">
                <ul className="flex flex-col gap-4 list-disc">
                    <li>
                        <span className="key">?</span> open help
                    </li>

                    <li>
                        <span className="key">Esc</span> close
                    </li>

                    <li>
                        <span className="key">Ctrl</span> +{" "}
                        <span className="key">j</span> open join-board form
                    </li>

                    <li>
                        <span className="key">Ctrl</span> +{" "}
                        <span className="key">;</span> open create-board form
                    </li>
                </ul>

                <div className="mt-6">
                    <span className="underline">tips</span>
                    <span>{": "}</span>
                    <span>
                        using key shortcuts will make your workflow so much
                        faster.
                    </span>
                </div>
            </div>
        </ModalDialog>
    );
};

export default BoardsHelp;
