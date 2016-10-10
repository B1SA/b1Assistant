//Auxiliar Functions

var paper    = 'R00001', // Printer Paper
    drive    = 'I00004', // USB Flash Drive
    ink      = 'I00008', // Printer Ink
    customer = 'C99998'; // Web Customer

function validateInput(input){
    // Avoid undefined inputs
    if (input === undefined){
        return null;
    }
    
    return input;
}

function getCustomer(){
    return customer;
}

function extractItem(item){
    
    if (item === null){
        return null;
    }
    
    var auxitem = item.toLowerCase();
    
    if (auxitem.indexOf('ink')>=0){
        return ink;
    }
    
    if (auxitem.indexOf('paper')>=0){
        return paper;
    }
    
    if (auxitem.indexOf('drive')>=0){
        return drive;
    }
    return item;
}

function getDateTime(withHour){
    var currentdate = new Date(); 
    var datetime = currentdate.getFullYear() + "-"
                + (currentdate.getMonth()+1)  + "-" 
                + currentdate.getDate() ;
                
    if (withHour){
        datetime +=  " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    }
                
    return datetime;
}