const gallery = document.querySelector('#gallery');
const path = document.URL;


const socket = io('/');
const peer = new Peer({
    host: '/',
    port: '3001'
});

const peers = {};

const getUserMedia = navigator.mediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
const myVideo = document.createElement('video');

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

getUserMedia({video: true, audio: true}).then(stream => {

    myVideo.muted = 'true';
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        const video = document.createElement('video');
        console.log('Call received')
        call.answer(stream);
        call.on('stream', remoteStream => {
            addVideoStream(video, remoteStream);
        });

        call.on('close', ()=>{
            video.remove();
        });
    })

    socket.on('user-connected', userId => {
        callNewUser(userId, stream);
    })

    socket.on('user-disconnected', userId => {
        peers[userId].close()
    })

})


const addVideoStream = (newVideo, stream) => {
    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'video-wrapper rounded w-full h-auto sm:w-1/2 sm:h-1/2';
    newVideo.className = 'h-full w-full';
    newVideo.autoplay = true;
    newVideo.srcObject = stream;
    videoWrapper.append(newVideo)
    gallery.append(videoWrapper);
}

const callNewUser = (userId, stream) => {
    const video = document.createElement('video');
    const call = peer.call(userId, stream);

    call.on('stream', stream => {
        addVideoStream(video, stream);
    });

    call.on('close', ()=>{
        video.remove();
    });

    peers[userId] = call;
}
