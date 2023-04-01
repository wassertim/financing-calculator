const fs = require('fs');

function calculateMonthlyInterestAndRepayment({ realEstatePrice, interestRate, creditAmount, years, monthlyRepayment, startMonth, startYear, monthlyIncome, taxRate, yearlySpecialRepaymentPercent = 0 }) {
    const months = years * 12;
    const ownCapital = realEstatePrice - creditAmount;
    const monthlyInterestRate = interestRate / 100 / 12;
    const monthlyTaxRate = taxRate / 100;
    let totalInterest = 0;
    let totalTaxPayment = 0;
    let totalNetIncome = 0;
    let remainingPrincipal = creditAmount;
    let lastYear;
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    for (let i = 1; i <= months; i++) {
        const interestPayment = remainingPrincipal * monthlyInterestRate;
        totalInterest += interestPayment;

        // Update remaining principal after repayment
        remainingPrincipal -= (monthlyRepayment - interestPayment);

        // Apply yearly special repayment
        if (i % 12 === 0) {
            const specialRepayment = remainingPrincipal * (yearlySpecialRepaymentPercent / 100);
            remainingPrincipal -= specialRepayment;
        }

        if (remainingPrincipal < 0) {
            remainingPrincipal = 0;
        }

        const incomeAfterInterest = monthlyIncome - interestPayment;
        const taxPayment = incomeAfterInterest * monthlyTaxRate;
        const netIncome = incomeAfterInterest - taxPayment;
        totalTaxPayment += taxPayment;
        totalNetIncome += netIncome;

        const currentMonthIndex = (startMonth + i - 1) % 12;
        const currentMonthName = monthNames[currentMonthIndex];
        const currentYear = startYear + Math.floor((startMonth + i - 1) / 12);
        if (!lastYear && remainingPrincipal === 0) {
            lastYear = currentYear;
        }
        // console.log(
        //     `Month ${i} (${currentMonthName}, ${currentYear}): Interest payment = $${interestPayment.toFixed(2)}, Remaining principal = $${remainingPrincipal.toFixed(2)}, Tax payment = $${taxPayment.toFixed(2)}, Net income = $${netIncome.toFixed(2)}`
        // );
    }

    return {
        creditAmount,
        totalInterest,
        totalTaxPayment,
        years,
        lastYear,
        totalNetIncome,
        remainingPrincipal,
        realEstatePrice,
        ownCapital,
        monthlyRepayment
    };
}


function print({ years, totalInterest, totalTaxPayment, totalNetIncome, remainingPrincipal, creditAmount, realEstatePrice, ownCapital, lastYear, monthlyRepayment }) {
    console.log(`
    Real estate price: $${realEstatePrice}
    Own capital: $${ownCapital}
    Credit amount: $${creditAmount}
    Monthly repayment: $${monthlyRepayment}
    Total interest to pay for ${years} years: $${totalInterest.toFixed(2)}
    Total tax payment: $${totalTaxPayment.toFixed(2)}
    Total cost: $${(totalInterest + totalTaxPayment).toFixed(2)}
    Total net income: $${totalNetIncome.toFixed(2)}
    Income minus total cost: $${(totalNetIncome - totalInterest - totalTaxPayment).toFixed(2)}
    Remaining principal: $${remainingPrincipal.toFixed(2)}
    Last year: ${lastYear}
    `);
}

const data = fs.readFileSync('data.json');
const {years, realEstatePrice, financeVariants} = JSON.parse(data);

financeVariants.forEach(financeVariant => {
    print(calculateMonthlyInterestAndRepayment({...financeVariant, realEstatePrice, years}));
});