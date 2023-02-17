let user1 = document.getElementById("user-1");
let user2 = document.getElementById("user-2");

let createOfferBtn = document.getElementById("create-offer");
let createAnswerBtn = document.getElementById("create-answer");
let addAnswerBtn = document.getElementById("add-answer");

let localStream;
let remoteStream;
let peerConnection;

let init = async () => {
	localStream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: false,
	});

	user1.srcObject = localStream;
};
//STUN servers

let servers = {
	iceServers: [
		{
			urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
		},
	],
};

//create offer by peer 1
let createOffer = async () => {
	peerConnection = new RTCPeerConnection(servers);

	//init remote server
	remoteStream = new MediaStream();
	user2.srcObject = remoteStream;

	//add local stream to peer connection
	localStream.getTracks().forEach((track) => {
		peerConnection.addTrack(track, localStream);
	});

	//add remote stream from peer connection
	peerConnection.ontrack = async (event) => {
		event.streams[0].getTracks().forEach((track) => {
			remoteStream.addTrack(track);
		});
	};

	// //ice candidates
	peerConnection.onicecandidate = async (event) => {
		if (event.candidate) {
			document.getElementById("offer-sdp").value = JSON.stringify(
				peerConnection.localDescription,
			);
		}
	};

	let offer = await peerConnection.createOffer();

	//local desc of peer 1
	await peerConnection.setLocalDescription(offer);

	document.getElementById("offer-sdp").value = JSON.stringify(offer);
};

//create answer by peer 2
let createAnswer = async () => {
	peerConnection = new RTCPeerConnection(servers);

	//init remote server
	remoteStream = new MediaStream();
	user2.srcObject = remoteStream;

	//add local stream to peer connection
	localStream.getTracks().forEach((track) => {
		peerConnection.addTrack(track, localStream);
	});

	//add remote stream from peer connection
	peerConnection.ontrack = async (event) => {
		event.streams[0].getTracks().forEach((track) => {
			remoteStream.addTrack(track);
		});
	};

	// //ice candidates
	peerConnection.onicecandidate = async (event) => {
		if (event.candidate) {
			document.getElementById("offer-sdp").value = JSON.stringify(
				peerConnection.localDescription,
			);
		}
	};

	let offer = document.getElementById("offer-sdp").value;

	if (!offer) return alert("empty offer");

	offer = JSON.parse(offer);

	//peer 2 remote desc is offer sent by peer 2
	await peerConnection.setRemoteDescription(offer);

	let answer = await peerConnection.createAnswer();

	//peer 2 local desc is set as answer
	await peerConnection.setLocalDescription(answer);

	document.getElementById("answer-sdp").value = JSON.stringify(answer);
};

//adding remote description to peer 1

let addAnswer = async () => {
	let answer = document.getElementById("answer-sdp").value;

	if (!answer) return alert("empty answer");

	answer = JSON.parse(answer);

	if (!peerConnection.currentRemoteDescription) {
		peerConnection.setRemoteDescription(answer);
	}
};

init();

createOfferBtn.addEventListener("click", createOffer);
createAnswerBtn.addEventListener("click", createAnswer);
addAnswerBtn.addEventListener("click", addAnswer);
