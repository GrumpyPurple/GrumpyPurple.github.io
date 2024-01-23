function playerBusinessName() {
    data.name = document.getElementById('businessName').value;
}

function startIntervals() {
    setInterval(earnIncome, incomeInterval);
    // setInterval(() => player.saveToCookies(), autoSaveInterval * 1000);
}

function earnIncome() {
    data.money += data.income * (incomeInterval / 1000);
    updateMoneyView();
}

function work() {
    player.money += data.job.payRate;
    updateMoneyView();

    player.xp += 1;
    data.updateJob();
}

function buyProperty(propertyId) {
    //find the property
    const property = data.properties.find((p) => p.id === propertyId);

    //make the transaction
    if (property && player.money >= property.inflatedCost) {
        player.money -= property.inflatedCost;
        player[propertyId] += 1;

        //update data/page
        property.inflateCost();
        data.checkIncome();
        updatePage();
    } else {
        sendMessage("Not enough money to buy the property!");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    data.loadData();
});
