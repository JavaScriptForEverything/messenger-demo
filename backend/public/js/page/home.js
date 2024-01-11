'use strict'

// const data = {
// 	id: 102,
// 	title: 'foo',
// 	body: 'bar',
// 	userId: 1,
// }


// fetch('/api/users')
// .then(res => res.json())
// .then(console.log)


// fetch('/api/users/form-data', {
// 	headers: {
// 		'Content-Type': 'multipart/form-data'
// 	}
// })
// .then(res => res.text())
// .then(console.log)




// const controller = new AbortController()
// const signal = controller.signal

// signal.addEventListener('abort', (evt) => {
// 	console.log(signal.aborted)
// })
// controller.abort()




const controller = new AbortController()
const isSuccess = true

const promise = new Promise((success, reject) => {

	controller.signal.addEventListener('abort', () => {
		reject(`AbortError: ${controller.signal.reason}`)
	})

	if(isSuccess) {
		// controller.abort()
		controller.abort('my custom error message')
		success('my data')

	} else {
		reject('rejected data')
	}

})

promise
	.then( res => console.log(res) )
	.catch( err => console.log(err) )


// const url = 'https://jsonplaceholder.typicode.com/users/1'

// const controller = new AbortController()
// const fetchHandler = async () => {
// 	try {
// 		const res = await fetch(url, { signal: controller.signal })
// 		const data = await res.json()
// 		console.log(data)

// 	} catch (err) {
// 		if(err.name === 'AbortError') {
// 			console.log('AbortError: ', err.message)

// 			console.log(controller.signal.reason)

// 			return
// 		}
// 		console.log(err)
// 	}
// }
// fetchHandler()
// setTimeout(() => {
// 	// controller.abort()
// 	controller.abort('testing error')
// }, 10)




// addEventListener(type, options)
// signal: 

// const controller = new AbortController()
// const { signal } = controller

// const log = () => {
// 	console.log('mouse moves')
// }
// const removeListeners = () => {
// 	controller.abort('closed message')
// }

// window.addEventListener('mousemove', log, { signal: controller.signal })
// window.addEventListener('mouseup', removeListeners, { signal })













/*

// const $ = (selector) => document.querySelector(selector)

// const audio = $('audio[name=notification]')
// const duration = $('#duration')

// audio.addEventListener('loadedmetadata', () => {
// 	console.log(audio.duration)
// })




var audio = document.getElementById("audio");

function setupSeek() {
    var seek = document.getElementById("audioSeek");
    seek.min = 0;
    seek.max = Math.round(audio.duration);
    seek.value = 0;
    var duration = document.getElementById("duration");
    duration.innerHTML = "0/" + Math.round(audio.duration);
}

function togglePlay() {
    if (audio.paused || audio.ended) {
        audio.play();
    }
    else {
        audio.pause();
    }
}

function updatePlayPause() {
    var play = document.getElementById("play");
    if (audio.paused || audio.ended) {
        play.value = "Play";
    }
    else {
        play.value = "Pause";
    }
}

function endAudio() {
  document.getElementById("play").value = "Play";
  document.getElementById("audioSeek").value = 0;
  document.getElementById("duration").innerHTML = "0/" + Math.round(audio.duration);
}

audio.addEventListener("durationchange", setupSeek, false);
document.getElementById("play").addEventListener("click", togglePlay, false);
audio.addEventListener("play", updatePlayPause, false);
audio.addEventListener("pause", updatePlayPause, false);
audio.addEventListener("ended", endAudio, false);

*/