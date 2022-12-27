// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBv42VZ6-Ly764IRl0joK1b0jU_Zaq7O7s",
  authDomain: "updo-2f41e.firebaseapp.com",
  projectId: "updo-2f41e",
  storageBucket: "updo-2f41e.appspot.com",
  messagingSenderId: "219893410512",
  appId: "1:219893410512:web:74ec292c0e9e2d58de8cd5",
  measurementId: "G-V70D3QVDVD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Global variables

let dropArea = document.getElementById("drop-area");
let selectBtn = document.getElementById("select-btn");
let form = document.getElementById("form");
let uploadName = document.getElementById("upload-name");
let uploadKey = document.getElementById("upload-key");
let uploadBtn = document.getElementById("upload-btn");
let downloadBtn = document.getElementById("download-btn");
let downloadName = document.getElementById("download-name");
let downloadKey = document.getElementById("download-key");
let uploadNameMsg = document.getElementById("upload-name-msg");
let uploadKeyMsg = document.getElementById("upload-key-msg");
let downloadNameMsg = document.getElementById("download-name-msg");
let downloadKeyMsg = document.getElementById("download-key-msg");
let name = [];
let size = [];
let files;
// Get files

const handleFile = () => {
  const prevents = (e) => e.preventDefault();

  ["dragenter", "dragover", "dragleave", "drop"].forEach((evtName) => {
    dropArea.addEventListener(evtName, prevents);
  });

  dropArea.addEventListener("drop", handleDrop);
  selectBtn.addEventListener("change", handleSelect);
};

const handleDrop = (e) => {
  const dt = e.dataTransfer;
  files = dt.files;
  handeChange();
};
const handleSelect = () => {
  files = selectBtn.files;

  handeChange();
};

const handeChange = () => {
  for (var file of files) {
    name.push(file.name);
    size.push(file.size);
  }
  uploadName.value = name[0];
  uploadKey.value = size[0];

  dropArea.classList.add("hidden");
  form.classList.add("flex");
  dropArea.classList.remove("flex");
  form.classList.remove("hidden");
};
// Upload validation

const handleUploadValidation = (e) => {
  e.preventDefault();

  let isNameValid = false;
  let isKeyValid = false;

  if (uploadName.value.length < 5 || uploadName.value.length > 30) {
    uploadNameMsg.style.display = "block";
    uploadName.style.borderColor = "red";
    isNameValid = false;
  } else {
    uploadName.style.borderColor = "black";
    uploadNameMsg.style.display = "none";
    isNameValid = true;
  }
  if (uploadKey.value.length < 3 || uploadKey.value.length > 16) {
    uploadKeyMsg.style.display = "block";
    uploadKey.style.borderColor = "red";
    isKeyValid = false;
  } else {
    uploadKey.style.borderColor = "black";
    uploadKeyMsg.style.display = "none";
    isKeyValid = true;
  }

  if (isNameValid && isKeyValid) {
    handleMetadataUpload();
  }
};
// Upload File Metadata to Firebase

const handleMetadataUpload = async () => {
  uploadBtn.innerHTML = "Uploading...";
  const docRef = await addDoc(collection(db, "file-metadata"), {
    name: uploadName.value,
    key: uploadKey.value,
    files: name,
  });
  hadleFileUpload();
};

// Upload File to Firebase

const hadleFileUpload = () => {
  for (let i = 0; i < files.length; i++) {
    const storageRef = ref(storage, `${uploadName.value}/${name[i]}`);
    uploadBytes(storageRef, files[i]).then((snapshot) => {
      console.log("Uploaded a blob or file!");
    });
  }
  uploadBtn.innerHTML = "Uploaded";
};

// Download Validation

const handleDownloadValidation = async (e) => {
  e.preventDefault();
  let isValid = false;
  const q = query(
    collection(db, "file-metadata"),
    where("name", "==", downloadName.value),
    where("key", "==", downloadKey.value)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    isValid = true;
    name = doc.data().files;
  });

  if (isValid == true) {
    handleDowlaod();
    downloadNameMsg.style.display = "none";
    downloadKeyMsg.style.display = "none";
    downloadName.style.borderColor = "black";
    downloadKey.style.borderColor = "black";
  } else {
    downloadNameMsg.style.display = "block";
    downloadKeyMsg.style.display = "block";
    downloadName.style.borderColor = "red";
    downloadKey.style.borderColor = "red";
  }
};

// Download File from Firebase
const handleDowlaod = () => {
  downloadBtn.innerHTML = "Downloading...";
  for (let i = 0; i < name.length; i++) {
    getDownloadURL(ref(storage, `${downloadName.value}/${name[i]}`)).then(
      (url) => {
        fetch(url)
          .then((res) => res.blob())
          .then((file) => {
            let tempUrl = URL.createObjectURL(file);
            const aTag = document.createElement("a");
            aTag.href = tempUrl;
            aTag.download = "";
            document.body.appendChild(aTag);
            aTag.click();
            URL.revokeObjectURL(tempUrl);
            aTag.remove();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    );
  }
  downloadBtn.innerHTML = "Downloaded";
};

if (document.title == "Updo") {
  document.addEventListener("DOMContentLoaded", handleFile);
  uploadBtn.addEventListener("click", handleUploadValidation);
} else {
  downloadBtn.addEventListener("click", handleDownloadValidation);
}
