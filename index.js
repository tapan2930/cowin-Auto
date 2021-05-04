const nodeMailer = require('nodemailer');
const puppeteer = require('puppeteer');
const userData = require('./config')

// const URL = 'https://www.cowin.gov.in/home'
// const AREACODE = "390020"
// const AGECAT = "18-44"
// flexRadioDefault3  45+
// flexRadioDefault1  18-44

const runApp = async () => {
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  await page.goto(userData.cowinInfo.url);
  await page.type("#mat-input-0", userData.cowinInfo.areaCode)
  await page.click(".pin-search-btn")
  await page.click("#flexRadioDefault1")
  let res = await page.evaluate(()=>{
      let query = document.querySelectorAll('div[class="vaccine-box vaccine-box1 vaccine-padding"] > a')
      let data = [...query]
      return data.map(d=>d.innerHTML.trim())
  })
  await browser.close();

  //   Checking avaliable slots
  let isSlotsAvailable = avaliableSlots(res)

  // If Slots Available send email   
  if(isSlotsAvailable){
    sendMail()
  }
};


let avaliableSlots = (slots)=>{
    // Checking for Empty Array
    if(slots.length === 0 ){
        return false
    }

    // Initial Condoition of Flag
    let isAvaliable = false

    // Filtering Avaliable slots
    let avaliable = slots.filter(slot=>{
        return slot !== "Booked" && slot !== "NA"
    })

    // If there is elemment present in array the slot is available, alse not
    if (avaliable.length > 0){
        isAvaliable = true
    }else{
        isAvaliable = false
    }

    return isAvaliable
}


const sendMail = ()=>{
    let transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
          user: userData.emailInfo.g_user,
          pass: userData.emailInfo.g_pass,
        }
      })

    let mailOption = {
        from:userData.emailInfo.from,
        to:userData.emailInfo.to,
        subject:"Avaliable Vaccine Slots",
        text:"New Available Slots Found. Visit to https://www.cowin.gov.in/home "
    }  

    transporter.sendMail(mailOption,(err,data)=>{
        if(err){
            console.log("Err",err)
        }else{
            console.log("Email Sent!!!")
        }
    })
}

console.log("App Running...")
setInterval(runApp, userData.appInfo.interval);
