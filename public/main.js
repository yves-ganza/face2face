const gallery = document.querySelector('#gallery');

const socket = io('/');
const peer = new Peer(undefined, {
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
    newVideo.className = 'h-96 w-94 p-4';
    newVideo.autoplay = true;
    newVideo.srcObject = stream;
    gallery.append(newVideo);
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
