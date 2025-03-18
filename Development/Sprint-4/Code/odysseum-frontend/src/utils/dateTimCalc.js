export const calculateDuration = (creationDate) => {
    
    // e.g. createDate =024-11-10T09:10:18.147Z
    // need to calculate the difference between the current date and the created date
    // and return the difference in a human readable format.
    //possible formats are seconds, minutes, hours ago and then dd-mm-yyyy if the date is more than a day old

    const currentDate = new Date();
    const createdDate = new Date(creationDate);

    const diff = currentDate - createdDate;
    
    const secondDiff = Math.floor(diff / 1000);
    const minuteDiff = Math.floor(secondDiff / 60);
    const hourDiff = Math.floor(minuteDiff / 60);
    const dayDiff = Math.floor(hourDiff / 24);

    if (secondDiff < 60) return `${secondDiff} seconds ago`; 
    else if (minuteDiff < 60) return `${minuteDiff} minutes ago`;
    else if (hourDiff < 24) return `${hourDiff} hours ago`;
    else if (dayDiff < 7) return `${dayDiff} days ago`;
    else
    {
        const day = createdDate.getDate().toString().padStart(2, '0');
        const month = (createdDate.getMonth() + 1).toString().padStart(2, '0');
        const year = createdDate.getFullYear();
        return `${day}-${month}-${year}`;
    }
}