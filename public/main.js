const gallery = document.querySelector('#gallery');
let myId, remoteVideo;
const socket = io('/');
const peer = new Peer();
const peers = {};
const getUserMedia = navigator.mediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

const handleRefresh = () => {
    if(remoteVideo){
        const wrapper = document.createElement('div');
        wrapper.className = 'video-wrapper flex items-center justify-center py-4 w-full h-full max-w-sm';

        const remoteVideoEl = document.createElement('video');
        remoteVideoEl.autoplay = true;
        remoteVideoEl.className = 'w-full remote-video';

        remoteVideoEl.srcObject = remoteVideo;
        wrapper.append(remoteVideoEl);
        gallery.append(wrapper);
    }
    else{
        const remoteVideoEl = document.querySelector('.remote-video');
        if(remoteVideoEl) remoteVideoEl.remove();
    }
}

const addVideoStream = (stream) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'video-wrapper flex items-center justify-center py-4 w-full  max-w-sm';

    const myVideo = document.createElement('video');
    myVideo.muted = true;
    myVideo.className = 'w-full';
    myVideo.id = 'local-video'
    myVideo.autoplay = true;
    myVideo.srcObject = stream;

    wrapper.append(myVideo);    
    gallery.append(wrapper);
    return myVideo;
}

const callNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const remoteVideoEl = document.createElement('video');
    remoteVideoEl.autoplay = true;
    remoteVideoEl.className = 'w-full remote-video';

    const wrapper = document.createElement('div');
    wrapper.className = 'video-wrapper flex items-center justify-center py-4 w-full max-w-sm';

    call.on('stream', stream => {
        remoteVideo = stream;
        remoteVideoEl.srcObject = stream;
        wrapper.append(remoteVideoEl);
        gallery.append(wrapper);

    });

    call.on('close', ()=>{
        wrapper.parentElement.removeChild(wrapper);
        remoteVideoEl.remove();
    });

    peers[userId] = call;
}


if(!window.peerjs.util.supports.audioVideo){
    alert('Your current browser is not supported, Please use a modern browser');
}
else{
    //When connected to the peer server
    peer.on('open', id => {
        myId = id;
        socket.emit('join-room', ROOM_ID, id);
    });

    window.onunload = () => {
        peer.destroy();
        console.log('peer closed');
        return null;
    }

    peer.on('close', () => {
        document.querySelector('.remote-video').parentElement.remove();
        document.querySelector('.remote-video').remove();
    })


    getUserMedia({video: true, audio: true}).then(stream => {

        addVideoStream(stream);

        socket.on('user-connected', userId => {
            callNewUser(userId, stream);
        })

        //Receive call
        peer.on('call', call => {
            const remoteVideoEl = document.createElement('video');
            const wrapper = document.createElement('div');
            wrapper.className = 'video-wrapper flex items-center justify-center py-4 w-full max-w-sm';
            remoteVideoEl.autoplay = true;
            remoteVideoEl.className = 'w-full remote-video';

            console.log(call);
            console.log('call received!');

            call.answer(stream);

            call.on('stream', remoteStream => {
                remoteVideo = remoteStream;
                remoteVideoEl.srcObject = remoteStream;
                wrapper.append(remoteVideoEl);
                gallery.append(wrapper);
            });

            call.on('close', ()=>{
                wrapper.parentElement.removeChild(wrapper);
                remoteVideoEl.remove();
            });
        })



        socket.on('user-disconnected', userId => {
            peers[userId] && peers[userId].close();
        })

    })
}

