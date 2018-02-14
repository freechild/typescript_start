import { sayHello } from './greet';

function showHello(divName: string, name: string){
    const elt:any= document.getElementById(divName);
    elt.innerText = sayHello(name);
}

showHello("greeting", "TypeScript");

