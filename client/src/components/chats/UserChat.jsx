import { useFetchRecipientUser } from '../../hooks/useFetchRecipient'
import { Stack } from 'react-bootstrap'
import avatar from '../../assets/avatar.svg'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext'
import { unreadNotificationsFunc } from '../../utils/unreadNotifications'
import { useFetchLatestMessage } from '../../hooks/useFetchMessage'
import moment from 'moment'


const UserChat = ({ chat, user }) => {

    const { recipientUser } = useFetchRecipientUser(chat, user)
    const {onlineUsers , notifications, markThisUserNotificationsAsRead} = useContext(ChatContext)

    const {latestMessage} = useFetchLatestMessage(chat)

    const unReadNotifications= unreadNotificationsFunc(notifications)
    const thisUserNotification = unReadNotifications?.filter(
        n=> n.senderId === recipientUser?._id
    )

    

 
    const truncateText = (text)=>{
        let shortText = text.substring(0,20)

        if (text.length > 20) {
            shortText = shortText + "..."
        }
        return shortText
    }

    const isOnline =  onlineUsers?.some((user)=>user?.userId === recipientUser?._id ) 


    return (
        <>
            <Stack 
                direction="horizontal" 
                role="button" 
                gap={3} 
                className="user-card align-items-center p-2 justify-content-between"
                onClick={()=>{
                    if(thisUserNotification?.length !== 0 ){
                        markThisUserNotificationsAsRead(
                            thisUserNotification, notifications
                        )
                    }
                }}
                >
                <div className="d-flex">
                    <div className="me-2">
                        <img src={avatar} height="35px" alt="" />
                    </div>
                    <div className="text-content">
                        <div className="name">{recipientUser?.name}</div>
                        <div className="text">{
                            latestMessage?.text && (
                                <span>{truncateText(latestMessage?.text)}</span>
                            )
                        }</div>
                    </div>
                </div>
                <div className="d-flex flex-column align-items-end ">
                    <div className="date">
                        {moment(latestMessage?.createdAt).calendar()}
                    </div>
                    <div className={thisUserNotification?.length > 0 ? "this-user-notifications" : ""}>
                        {thisUserNotification?.length > 0 ? thisUserNotification?.length : "" }
                        
                    </div>
                    <span className={isOnline ? 'user-online' : ""}></span>
                </div>

            </Stack>

            


        </>
    )
}

export default UserChat