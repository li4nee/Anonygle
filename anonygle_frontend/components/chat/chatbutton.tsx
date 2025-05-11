"use client"
import useSocketIo from "../../hook/socket/socketIo"

export default function ChatButton() {
    const { socket } = useSocketIo()

    const initiateChat = ()=>{
        if(!socket)
            return
        socket.emit("start-match-making")
    }
    return (
        <button 
        className="bg-red-800 p-3 rounded-2xl hover:cursor-pointer"
        onClick={initiateChat}>
        Start Chatting</button>
    )
}