/* import { createContext, useState,useEffect, useCallback} from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import {io} from "socket.io-client"

export const ChatContext = createContext()
export const ChatContextProvider = ({ children,user })=>{

    const [userChats, setUserChats] = useState(null)
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false)
    const [userChatsError, setUserChatsError] = useState(null)
    const [potentialChats, setPotentialChats] = useState([])
    const [currentChat, setCurrentChat] = useState(null)
    const [messages, setMessages] = useState(null)
    const [isMessagesLoading, setIsMessagesLoading] = useState(false)
    const [messagesError, setMessagesError] = useState(null)
    const [sendTextMessagesError, setSendTextMessagesError] = useState(null)
    const [newMessage, setNewMessage] = useState(null)
    const [socket, setSocket] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [notifications, setNotifications] = useState([])
    const [allUsers, setAllUsers] = useState([])

   // console.log("cuurentChat",currentChat)
    console.log("notif" , notifications)

    useEffect(()=>{
        const newSocket = io("http://localhost:3000")
        setSocket(newSocket)

        return ()=>{
            newSocket.disconnect()
        }
    },[user])





    // add online users
    useEffect(()=>{
        if(socket === null) return 
        socket.emit("addNewUser",user?._id)
        socket.on("getOnlineUsers",(res)=>{
            setOnlineUsers(res)
        })

        return ()=>{
            socket.off("getOnlineUsers")
        }
    },[socket])


    // send message
    useEffect(()=>{
        if(socket === null) return 

        const recipientId = currentChat?.members?.find((id) => id !== user?._id);
  

        socket.emit("sendMessage",{...newMessage, recipientId})


                

    },[newMessage])







    

    //recive message and notification
    useEffect(()=>{
        if(socket === null) return 

        socket.on("getMessage", (res,message) =>{
            if(currentChat?._id !== res.chatId) return
            setMessages((prev)=>[...prev, res])

            console.log("Received message:", message);
            setMessages((prevMessages) => [...prevMessages, message]);

        return () => {
            socket.off("chatMessage"); // İstemci tarafındaki dinleyiciyi kaldır
        }

           
        })

    

        socket.on("getNotification",(res)=>{
            //mesajı gönderen kişinin chati açık mı kontrolü açıksa bildirim olarak gostermicek okundu olucak
            const isChatOpen = currentChat?.members.some((id)=>id===res.senderId)

            if(isChatOpen){
                setNotifications((prev)=>[{...res, isRead:true},...prev])
            }else{
                setNotifications((prev)=>[res,...prev])
            }
        })

        return () =>{
            socket.off("getMessage")
            socket.off("getNotification")
        }

    },[socket, currentChat])



    useEffect(()=>{
        const getUsers = async()=>{
            const response = await getRequest(`${baseUrl}/users`)
            if(response.error){
                return console.log("Error fetching users", response) 
            }

            

           const pChats = response.filter((u)=>{
            let isChatCreated  =false
                if(user?._id === u._id) return false

                if(userChats){
                   isChatCreated= userChats?.some((chat)=>{
                        return chat.members[0] === u._id || chat.members[1] === u._id
                    })
                }

                return !isChatCreated
            })

       setPotentialChats(pChats)
       setAllUsers(response)
        }
        getUsers()
    },[userChats]) 

    

    useEffect(() => {
        const getUserChats = async () => {
            if (user?._id) {
                setIsUserChatsLoading(true);
                setUserChatsError(null)
                const response = await getRequest(`${baseUrl}/chats/${user?._id}`)
                setIsUserChatsLoading(false);
                if (response.error) {
                    return setUserChatsError(response)
                }
                setUserChats(response);
            }
        }
        getUserChats()
    }, [user,notifications])


    useEffect(() => {
        const getMessages = async () => {
                setIsMessagesLoading(true);
                setMessagesError(null)

                const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`)
                
                setIsMessagesLoading(false);

                if (response.error) {
                    return setMessagesError(response)
                }
                setMessages(response);
            
        }
        getMessages()
    }, [currentChat])

    const sendTextMessage = useCallback(async(textMessage,sender, currentChatId, setTextMessage)=>{

        if(!textMessage) return console.log("You must type something...")

        const response = await postRequest(`${baseUrl}/messages`, JSON.stringify({
                chatId: currentChatId,
                senderId: sender._id,
                text: textMessage
        }))

        if (response.error) {
            return setSendTextMessagesError(response)
        }

        setNewMessage(response)
        setMessages((prev)=>[...prev,response])
        setTextMessage("")
        
    },[])

    const updateCurrentChat = useCallback((chat)=>{
        setCurrentChat(chat)
    },[])

    const createChat = useCallback(async(firstId,secondId)=>{

        const response = await postRequest(
            `${baseUrl}/chats`,
            JSON.stringify({firstId,secondId}) )

            
        if(response.error){
            return console.log("Error creating chat",response)
        }
        setUserChats((prev)=>[...prev, response])

    },[])





    const markAllNotificationAsRead = useCallback((notifications)=>{
        const mNotifications = notifications.map(n=>{
            return {...n,isRead:true}
        })

        setNotifications(mNotifications)

    },[])

    const markNotificationAsRead =useCallback((n, userChats, user, notificaiton)=>{
        //find chat to open
        const desiredChat = userChats.find(chat=>{
            const chatMembers = [user._id, n.senderId]
            const isDesiredChat = chat?.members.every(member =>{
                return chatMembers.includes(member)
            })
            
            return isDesiredChat
        })

        // mark notification as read

        const mNotifications = notifications.map(el=>{
            if(n.senderId === el.senderId){
                return {...n, isRead:true}
            }else{
                return el
            }
        }) 

        updateCurrentChat(desiredChat)
        setNotifications(mNotifications)

    },[])

    const markThisUserNotificationsAsRead =useCallback((thisUserNotification,notifications)=>{
        //mark notification read

       const mNotifications = notifications.map(el=>{
        let notificaiton
        thisUserNotification.forEach(n=>{
            if(n.senderId === el.senderId){
                notificaiton = {...n, isRead:true}
            }else{
                notificaiton = el
            }
        })

        return notificaiton
       })

       setNotifications(mNotifications)
    },[])

   

    return <ChatContext.Provider value={{ 
        userChats, 
        isUserChatsLoading, 
        userChatsError,
        potentialChats ,
        createChat,
        updateCurrentChat,
        messages,
        messagesError,
        isMessagesLoading,
        currentChat,
        sendTextMessage,
        socket,
        newMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotificationAsRead,
        markNotificationAsRead,
        markThisUserNotificationsAsRead,
        
        
        }}>

        {children}
    </ChatContext.Provider>

}

 */



// context/ChatContext.js

import { createContext, useState, useEffect, useCallback } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    const [sendTextMessagesError, setSendTextMessagesError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [generalMessages, setGeneralMessages] = useState([]);
    const [isGeneralMessagesLoading, setIsGeneralMessagesLoading] = useState(false);
    const [generalMessagesError, setGeneralMessagesError] = useState(null);
    const [generalRoom, setGeneralRoom] = useState(null);

    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if (socket === null) return;
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res);
        });


        return () => {
            socket.off("getOnlineUsers");
        };
    }, [socket]);





    useEffect(() => {
        if (socket === null) return;

        const recipientId = currentChat?.members?.find((id) => id !== user?._id);

        socket.emit("sendMessage", { ...newMessage, recipientId });
    }, [newMessage]);

    useEffect(() => {
        if (socket === null) return;

        socket.on("getMessage", (res) => {
            if (currentChat?._id !== res.chatId) return;
            setMessages((prev) => [...prev, res]);
        });

        socket.on("getNotification", (res) => {
            const isChatOpen = currentChat?.members.some((id) => id === res.senderId);

            if (isChatOpen) {
                setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
            } else {
                setNotifications((prev) => [res, ...prev]);
            }
        });



        socket.on('initialMessages', (messages) => {
            setGeneralMessages(messages);
            setIsGeneralMessagesLoading(false);
          });
      
          socket.on('newMessage', (message) => {

            setGeneralMessages((prevMessages) => [...prevMessages, message]);
          });

        return () => {
            socket.off("getMessage");
            socket.off("getNotification");
            socket.off('initialMessages');
            socket.off('newMessage');
            socket.off('connect_error');
        };
    }, [socket, currentChat]);





    useEffect(() => {
        const getUsers = async () => {
            const response = await getRequest(`${baseUrl}/users`);
            if (response.error) {
                return console.log("Error fetching users", response);
            }

            const pChats = response.filter((u) => {
                let isChatCreated = false;
                if (user?._id === u._id) return false;

                if (userChats) {
                    isChatCreated = userChats?.some((chat) => {
                        return chat.members[0] === u._id || chat.members[1] === u._id;
                    });
                }

                return !isChatCreated;
            });

            setPotentialChats(pChats);
            setAllUsers(response);
        };
        getUsers();
    }, [userChats]);

    useEffect(() => {
        const getUserChats = async () => {
            if (user?._id) {
                setIsUserChatsLoading(true);
                setUserChatsError(null);
                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);
                setIsUserChatsLoading(false);
                if (response.error) {
                    return setUserChatsError(response);
                }
                setUserChats(response);
            }
        };
        getUserChats();
    }, [user, notifications]);

    useEffect(() => {
        const getMessages = async () => {
            if (!currentChat?._id) return;
            setIsMessagesLoading(true);
            setMessagesError(null);

            const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);

            setIsMessagesLoading(false);

            if (response.error) {
                return setMessagesError(response);
            }
            setMessages(response);
        };
        getMessages();
    }, [currentChat]);

    const sendTextMessage = useCallback(async (textMessage, sender, currentChatId, setTextMessage) => {
        if (!textMessage) return console.log("You must type something...");

        const response = await postRequest(`${baseUrl}/messages`, JSON.stringify({
            chatId: currentChatId,
            senderId: sender._id,
            text: textMessage,
        }));

        if (response.error) {
            return setSendTextMessagesError(response);
        }

        setNewMessage(response);
        setMessages((prev) => [...prev, response]);
        setTextMessage("");
    }, []);

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, []);

    const createChat = useCallback(async (firstId, secondId) => {
        const response = await postRequest(`${baseUrl}/chats`, JSON.stringify({ firstId, secondId }));

        if (response.error) {
            return console.log("Error creating chat", response);
        }
        setUserChats((prev) => [...prev, response]);
    }, []);

  

    const markNotificationAsRead = useCallback((n, userChats, user, notification) => {
        const desiredChat = userChats.find(chat => {
            const chatMembers = [user._id, n.senderId];
            const isDesiredChat = chat?.members.every(member => {
                return chatMembers.includes(member);
            });

            return isDesiredChat;
        });

        const mNotifications = notifications.map(el => {
            if (n.senderId === el.senderId) {
                return { ...n, isRead: true };
            } else {
                return el;
            }
        });

        updateCurrentChat(desiredChat);
        setNotifications(mNotifications);
    }, []);

    const markThisUserNotificationsAsRead = useCallback((thisUserNotification, notifications) => {
        const mNotifications = notifications.map(el => {
            let notification;
            thisUserNotification.forEach(n => {
                if (n.senderId === el.senderId) {
                    notification = { ...n, isRead: true };
                } else {
                    notification = el;
                }
            });

            return notification;
        });

        setNotifications(mNotifications);
    }, []);

    // Fetch or create the general chat room
 /*    useEffect(() => {
        const createOrGetGeneralRoom = async (name,membersId) => {
            const response = await postRequest(`${baseUrl}/chatRooms/createChatRoom`,JSON.stringify({
                name: name,
                members : [membersId]
               
            }));
            if (response.error) {
                return console.log("Error creating/getting general room", response);
            }
            setGeneralRoom(response);
        };
        createOrGetGeneralRoom();
    }, []);
 */
    // Fetch general messages
    useEffect(() => {
        const getGeneralMessages = async () => {
            setIsGeneralMessagesLoading(true);
            setGeneralMessagesError(null);

            const response = await getRequest(`${baseUrl}/chatRooms/messages/66445ed545486758562b8673`);

            setIsGeneralMessagesLoading(false);

            if (response.error) {
                return setGeneralMessagesError(response);
            }
            setGeneralMessages(response);
        };
        getGeneralMessages();
    }, []);

     const sendGeneralMessage = useCallback(async (textMessage,user, setTextMessage) => {
        if (!textMessage) return console.log("You must type something...");

        const response = await postRequest(`${baseUrl}/chatRooms/messages/66445ed545486758562b8673`, JSON.stringify({
            _id: Math.random().toString(36).substr(2, 9),
            chatId: '66445ed545486758562b8673',
            senderId: user._id,
            senderName : user.name,
            text: textMessage,
        }));



        if (response.error) {
            return setSendTextMessagesError(response);
        }

        setNewMessage(response);
        setGeneralMessages((prev) => [...prev, response]);
        socket.emit('newMessage', response);

        setTextMessage("");
  
    }, [generalRoom]); 



    const markAllNotificationAsRead = useCallback((notifications) => {
        const mNotifications = notifications.map(n => {
            return { ...n, isRead: true };
        });

        setNotifications(mNotifications);
    }, []);

/*   const sendGeneralMessage = (text, user, setTextMessage) => {
    const message = {
      _id: Math.random().toString(36).substr(2, 9),
      senderId: user._id,
      senderName: user.name,
      text,
      createdAt: new Date()
    };
    socket.emit('newMessage', message);
    setTextMessage('');
  };
 */




    return (
        <ChatContext.Provider value={{
            userChats,
            isUserChatsLoading,
            userChatsError,
            potentialChats,
            createChat,
            updateCurrentChat,
            messages,
            messagesError,
            isMessagesLoading,
            currentChat,
            sendTextMessage,
            socket,
            newMessage,
            onlineUsers,
            notifications,
            allUsers,
            markAllNotificationAsRead,
            markNotificationAsRead,
            markThisUserNotificationsAsRead,
            generalMessages,
            isGeneralMessagesLoading,
            generalMessagesError,
            sendGeneralMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
};
