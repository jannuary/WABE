// let test = ()=>{
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve('success')
//             console.log(1)
//         }, 2000)
//     })
// }


// test().then(()=>{
//     console.log("xxx")
// })

// function takeLongTime(n) {
//     return new Promise(resolve => {
//         console.log(`step1 with ${n}`);
//         setTimeout(() => resolve(n + 200), n);
//     });
// }

// let sec = (n)=>{
//     return takeLongTime(n);
// }

// let fir = (n)=>{
//     return takeLongTime(n);
// }

// let doIt = async ()=>{
//     let t = 5000;
//     let a = await fir(t);
//     console.log(a);
//     t = 1000;
//     let b = await sec(t);
//     console.log(b);
//     console.log(a+b);
// }

// doIt();

function* countAppleSales () {
    var saleList = [3, 7, 5];
    yield setTimeout(()=>{
        console.log(1)
        },5000)
        yield setTimeout(()=>{
            console.log(2)
            },2000)
}

var appleStore = countAppleSales(); // Generator { }
appleStore.next(); // { value: 3, done: false }
appleStore.next(); // { value: 7, done: false }





