import Peer from 'peerjs'
import { useEffect, useState } from 'react'
import { v4 as uuidV4 } from 'uuid'

export default function useWebRtc() {
    const [me,setMe]= useState<Peer | null>(null)

    useEffect(() => {
        const id = uuidV4()
        const peer = new Peer(id)
        setMe(peer)
    },[])
  
    return { me }
}
