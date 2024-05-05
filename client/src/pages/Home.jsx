import Title from "../components/ui/Title";

const Home = () => {
    return (
        <>
            <section className="w-full h-[calc(100%-75px)] overflow-auto pb-4">

                <div className='mx-auto sm:w-3/4 w-[90%]'>
                    <Title titleName={"home"} />

                    <section className="flex flex-col gap-4 justify-between items-center">
                        <div className='text-[10px] md:text-[0.65rem] lg:text-[0.85rem] text-gray-700'>
                            This project is a simple task management which you can create your own task-boards and collab with your friends (with a simple noting system).

                            <br />
                            <br />

                            <div className='border-[2px] border-dashed border-gray-500 md:p-4 p-2'>
                                <div className='underline mb-2'>
                                    About this project:
                                </div>
                                <ul className='flex flex-col gap-2 ms-4'>
                                    <li>
                                        - I want a task-management app with a simple notes system (+ keybinds)
                                    </li>
                                    <li>
                                        - Created from my own personal interest, and from everyday-workflow.
                                    </li>
                                    <li>
                                        - Easy to use.
                                    </li>
                                </ul>
                            </div>

                            <br />

                            <div className='border-[2px] border-dashed border-gray-500 md:p-4 p-2'>
                                <div className='w-fit mb-2 lg:float-left'>
                                    <span className='underline'>
                                        Keybinds:
                                    </span>
                                </div>

                                <div className='flex gap-4 justify-around'>
                                    <div className="flex flex-col gap-2">
                                        <div className='underline'>Global Keybinds:</div>
                                        <ul className='flex flex-col gap-2 ms-4 list-disc'>
                                            <li>
                                                1, 2, 3, 4: Navigate through pages
                                            </li>
                                            <li>
                                                5: Navigate to Last Viewed Board
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className='underline'>
                                            In-Board Keybinds:
                                        </div>
                                        <ul className='flex flex-col gap-2 ms-4 list-disc'>
                                            <li>
                                                Ctrl + Arrow Keys: Navigate through task-cards
                                            </li>
                                            <li>
                                                Ctrl + HJKL: Navigate through task-cards (for vim-users)
                                            </li>
                                            <li>
                                                Ctrl + e: Open Pinned-board list
                                            </li>
                                            <li>
                                                Ctrl + p: Open Filter form
                                            </li>
                                            <li>
                                                Ctrl + i: Open Invitation form
                                            </li>
                                            <li>
                                                Ctrl + m: Open Board Membership
                                            </li>
                                            <li>
                                                Ctrl + /: Focus description field in opened task-card (Card Details)
                                            </li>
                                            <li>
                                                Enter: Open focused task-card (Card Details)
                                            </li>
                                            <li>
                                                Esc: Close floating forms
                                            </li>
                                            <li>
                                                &lt;dot&gt;: Open Chat
                                            </li>
                                            <li>
                                                Shift + &lt;dot&gt;: Open Chat (Floating mode)
                                            </li>
                                        </ul>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                <a
                    href='https://github.com/TengNg/task-manager'
                    className='fixed right-4 bottom-3 text-gray-700 text-[0.75rem] underline'
                    target="_blank"
                >
                    Github
                </a>

            </section >
        </>
    )
}

export default Home
