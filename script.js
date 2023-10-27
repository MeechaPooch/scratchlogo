// const API = 'http://localhost:4560'
const API = 'https://assortedgummies.uk.to:4560'



//////
let fileElem=document.querySelector("#file")
let dropArea=document.querySelector('.mainSection')
let usernameButton=document.querySelector('#usernamebutton')
let usernameInput=document.querySelector('#usernameinput')
let converting=document.querySelector('#converting')
let doneElem=document.querySelector('#done')
let mylink=document.querySelector('#mylink')
let errorbox=document.querySelector('#error')
let errormessage=document.querySelector('#errormessage')
let preview=document.querySelector('#preview')

var state=0;
//ready 0, loading 1, done 2


usernameButton.onclick=(e)=>{
e.preventDefault()
doStuffWithUsername(usernameInput.value)

}
usernameInput.addEventListener('keypress',(e)=>{
    if(e.key=='Enter'){
        doStuffWithUsername(usernameInput.value)
    }
})


async function doStuffWithUsername(name) {
    start()
    output = await fetch(API+'/user',{
        method:'post',
        body:name,
        headers:{
            "Content-Type":"application/image",
        }
    })
    if(output.status==400) {errorr(await output.text()); return;}


    // console.log(output)
    // console.log(output.body)

    let blob = await output.blob()
    console.log(blob)
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // the filename you want
    a.download = `${name}-hires.png`;
    document.body.appendChild(a);
    a.click();
    done(url)
}

async function doShitWithFile(file) {
    if(state==1) {return}
    if(state==2) {reset(); return}
    start()
    console.log(file)


    // let fileReader = new FileReader()
    // let dataUrl = fileReader.readAsDataURL(file)
    // fileReader.result
    // console.log(dataUrl)

    output = await fetch(API+'/image',{
        method:'post',
        body:file,
        headers:{
            "Content-Type":"application/image",
        }
    })
    if(output.status==400) {errorr(await output.text()); return;}

    // console.log(output)
    // console.log(output.body)

    let blob = await output.blob()
    console.log(blob)
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // the filename you want
    a.download = `${file.name.split('.')[0]}-hires.png`;
    document.body.appendChild(a);
    a.click();
    // window.URL.revokeObjectURL(url);
    // or you know, something with better UX...
    // alert('your file has downloaded!'); 
    // console.log(output.body)
    done(url);
}



function fileChoose(e) {
    if(state==1) {return}
    if(state==2) {reset(); return}
    console.log(e?.target?.getAttribute?.("name"))
    if(e?.target==usernameInput || e?.target==mylink) {return}
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = _ => {
      // you can use this method to get file and perform respective operations
            doShitWithFile(input.files[0])

          };
    input.click();
    
}
dropArea.onclick=fileChoose


dropArea.ondrop=(e)=>{
    e.preventDefault();
    console.log('YOOOOOO!!!')
    doShitWithFile(e.dataTransfer.files[0])
}
dropArea.ondragover=(e)=>{
    e.preventDefault();
    console.log(e)
}





function start(){
    converting.style.display='flex'
    errorbox.style.display='none'
    doneElem.style.display='none'
    state=1;
    document.documentElement.style.setProperty('--panelRot', '180deg');
    document.body.style.cursor='unset'
}
function done(url){
    state=2;
    converting.style.display='none'
    errorbox.style.display='none'
    doneElem.style.display='flex'
    document.body.style.cursor='unset'
    preview.src=url
}
function reset(){
    state=0;
    document.documentElement.style.setProperty('--panelRot', '0deg');
    document.body.style.cursor='pointer'
}
function errorr(e) {
    state=2;
    converting.style.display='none'
    errorbox.style.display='flex'
    doneElem.style.display='none'
    errormessage.innerText = e;
}