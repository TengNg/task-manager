import { io } from 'socket.io-client'
import useAuth from '../hooks/useAuth'
import { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const Activities = () => {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const { auth } = useAuth();

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        }
    }, [auth]);

    useEffect(() => {
        if (socket) {
            // const getBoardData = async () => {
            //     const response = await axiosPrivate.get(`/boards/6513c39a29b5f404f79eb158`);
            //     const boardState = response.data;
            //     socket.emit("addBoard", boardState);
            // }
            // getBoardData().catch(err => console.log(err));
            socket.on("receive_message", (data) => {
                console.log(data, socket);
                setMessages(prev => [...prev, data.message]);
            });
        }
    }, [socket]);

    const sendMessage = () => {
        socket.emit("send_message", { message });
        setMessages(prev => [...prev, message]);
    };

    return (
        <div>
            <input
                placeholder="Message..."
                onChange={(event) => {
                    setMessage(event.target.value);
                }}
            />
            <button onClick={sendMessage}> Send Message</button>
            <h1> Message:</h1>
            {messages.map(item => <p>{item}</p>)}
        </div>
    )
}

export default Activities
