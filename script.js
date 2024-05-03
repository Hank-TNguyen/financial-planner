function saveState(housePrice, annualInterestRate) {
    const state = JSON.stringify({ housePrice, annualInterestRate });
    localStorage.setItem('mortgageState', state);
  }
 
  
  function loadState() {
    const state = localStorage.getItem('mortgageState');
    return state ? JSON.parse(state) : null;
  }

// Save income calculator state to local storage
function saveIncomeState(annualIncome) {
    const state = JSON.stringify({ annualIncome });
    localStorage.setItem('incomeCalculatorState', state);
  }
  
  // Load income calculator state from local storage
  function loadIncomeState() {
    const state = localStorage.getItem('incomeCalculatorState');
    return state ? JSON.parse(state) : null;
  }
  
  // On startup, load the states for both mortgage and income calculators
document.addEventListener('DOMContentLoaded', () => {
    // Load and perform mortgage calculation if state exists
    const mortgageState = loadState();
    if (mortgageState) {
      document.getElementById('house-price').value = mortgageState.housePrice;
      document.getElementById('interest-rate').value = mortgageState.annualInterestRate;
      calculateMortgage(); // Perform mortgage calculation with loaded state
    }
  
    // Load and perform income calculation if state exists
    const incomeState = loadIncomeState();
    if (incomeState) {
      document.getElementById('annual-income').value = incomeState.annualIncome;
      calculateTax(); // Perform tax calculation with loaded state
    }

    // Load and perform Smith Maneuver calculation if state exists
    const smithManeuverState = loadSmithManeuverState();
    if (smithManeuverState) {
        document.getElementById('savings').value = smithManeuverState.savings;
        calculateSmithManeuver(); // Perform Smith Maneuver calculation with loaded state
    }

    // Add mouseover and mouseout event listeners to all rows in highlightable tables
    const tables = document.querySelectorAll('.highlightable');
    tables.forEach((table) => {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
        row.addEventListener('mouseover', () => highlightRows(index));
        row.addEventListener('mouseout', () => {
        // Remove highlight from all rows when the mouse leaves a row
        document.querySelectorAll('.highlight').forEach((highlightedRow) => {
            highlightedRow.classList.remove('highlight');
        });
        });
    });
    });
  });

// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################

// Save Smith Maneuver state to local storage
function saveSmithManeuverState(savings) {
    const state = JSON.stringify({ savings });
    localStorage.setItem('smithManeuverState', state);
  }
  
  // Load Smith Maneuver state from local storage
  function loadSmithManeuverState() {
    const state = localStorage.getItem('smithManeuverState');
    return state ? JSON.parse(state) : null;
  }
  
// Calculate Smith Maneuver based on savings and mortgage details
function calculateSmithManeuver() {
    const savings = parseFloat(document.getElementById('savings').value);
    if (isNaN(savings)) {
      document.getElementById('smith-maneuver-result').textContent = 'Please enter a valid savings amount.';
      return;
    }
    
    saveSmithManeuverState(savings); // Save state to local storage
  
    const mortgageTableRows = document.getElementById('mortgage-result').querySelectorAll('tbody tr');
    const resultsElement = document.getElementById('smith-maneuver-result');
    resultsElement.innerHTML = '<table><thead><tr><th>Down Payment Rate</th><th>Down Payment</th><th>Monthly Mortgage Payment</th><th>Swapped Amount</th><th>Tax Deductible</th></tr></thead><tbody></tbody></table>';
  
    mortgageTableRows.forEach((row, index) => {
      if (index < 6) { // Ensure only 6 rows are processed
        const downPaymentRate = row.cells[0].textContent; // Get the down payment rate from the mortgage table
        const downPayment = parseFloat(row.cells[1].textContent.replace(/[^0-9.-]+/g, ""));
        const annualInterestRate = parseFloat(row.cells[3].textContent.replace(/[^0-9.-]+/g, ""));
        const monthlyPayment = parseFloat(row.cells[6].textContent.replace(/[^0-9.-]+/g, ""));
        const swappedAmount = Math.max(savings - downPayment, 0); // Ensure swapped amount is not negative
        const tdInterest = swappedAmount * (annualInterestRate / 100); // Calculate TD Interest
  
        // Append Smith Maneuver scenario result to the Smith Maneuver results element
        resultsElement.querySelector('tbody').innerHTML += `
          <tr>
            <td>${downPaymentRate}</td>
            <td>$${downPayment.toFixed(2)}</td>
            <td>$${monthlyPayment.toFixed(2)}</td>
            <td>$${swappedAmount.toFixed(2)}</td>
            <td>$${tdInterest.toFixed(2)}</td>
          </tr>
        `;
      }
    });

    calculateCashflow();
  }

// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################

const downPaymentOptions = [
    { percentage: 0.10, insurance: 22320 }, // 10% down payment
    { percentage: 0.19, insurance: 18144 }, // 19% down payment
    { percentage: 0.20, insurance: 0 }      // 20% down payment, no insurance
  ];
  const amortizationPeriods = [25, 30]; // 25 and 30 years
  
  function calculateMortgagePayment(principal, annualInterestRate, amortizationPeriod) {
    const paymentsPerYear = 24; // Bimonthly payments
    const totalPayments = amortizationPeriod * paymentsPerYear;
    const monthlyInterestRate = (annualInterestRate / 100) / paymentsPerYear;
  
    const payment =
      (principal * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -totalPayments));
  
    return payment;
  }
  
  function calculateMonthlyPayment(bimonthlyPayment, insuranceAmount) {
    const insuranceMonthly = insuranceAmount / 3 / 12; // Insurance spread over 3 years, monthly
    return (2 * bimonthlyPayment) + insuranceMonthly;
  }
  
  function displayMortgageScenarios(housePrice, annualInterestRate) {
    const resultsElement = document.getElementById('mortgage-result').getElementsByTagName('tbody')[0];
    resultsElement.innerHTML = ''; // Clear previous results
  
    downPaymentOptions.forEach((option) => {
      const downPayment = housePrice * option.percentage;
      const loanAmount = housePrice - downPayment;
  
      amortizationPeriods.forEach((amortizationPeriod) => {
        const bimonthlyPayment = calculateMortgagePayment(loanAmount, annualInterestRate, amortizationPeriod);
        const monthlyPayment = calculateMonthlyPayment(bimonthlyPayment, option.insurance);
  
        // Append scenario result to the results element
        resultsElement.innerHTML += `
        <tr>
            <td>${(option.percentage * 100).toFixed(0)}%</td>
            <td>$${downPayment.toFixed(2)}</td>
            <td>$${loanAmount.toFixed(2)}</td>
            <td>${annualInterestRate.toFixed(2)}%</td>
            <td>${amortizationPeriod} years</td>
            <td>$${bimonthlyPayment.toFixed(2)}</td>
            <td>$${monthlyPayment.toFixed(2)}</td>
        </tr>
        `;
      });
    });
  }
  
  function calculateMortgage() {
    const housePrice = parseFloat(document.getElementById('house-price').value);
    const annualInterestRate = parseFloat(document.getElementById('interest-rate').value);
    
    if (isNaN(housePrice) || isNaN(annualInterestRate)) {
      alert('Please enter valid house price and interest rate.');
      return;
    }
  
    console.log(housePrice, annualInterestRate)
    saveState(housePrice, annualInterestRate); // Save state to local storage
    displayMortgageScenarios(housePrice, annualInterestRate);
  }


// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################

const federalTaxBrackets = [
    { threshold: 53359, rate: 0.15 },
    { threshold: 106717, rate: 0.205 },
    { threshold: 165430, rate: 0.26 },
    { threshold: 235675, rate: 0.29 },
    { threshold: Infinity, rate: 0.33 }
];

const bcTaxBrackets = [
    { threshold: 45654, rate: 0.0506 },
    { threshold: 91310, rate: 0.077 },
    { threshold: 104835, rate: 0.105 },
    { threshold: 127299, rate: 0.1229 },
    { threshold: 172602, rate: 0.147 },
    { threshold: 240716, rate: 0.168 },
    { threshold: Infinity, rate: 0.205 }
];

const deductions = {
    cpp: 0.0583, // CPP rate
    ei: 0.017, // EI rate
    rrsp: 0.03 // RRSP rate
};

function calculateProgressiveTax(income, brackets) {
    let tax = 0;
    let lastThreshold = 0;
    let marginalRate = 0;

    for (const { threshold, rate } of brackets) {
        if (income > threshold) {
            tax += (threshold - lastThreshold) * rate;
        } else {
            tax += (income - lastThreshold) * rate;
            marginalRate = rate;
            break;
        }
        lastThreshold = threshold;
    }

    return { tax, marginalRate };
}

function calculateDeductions(income, deductionRates) {
    const cpp = income * deductionRates.cpp;
    const ei = income * deductionRates.ei;
    const rrsp = income * deductionRates.rrsp;
    return { cpp, ei, rrsp };
}

function calculateTax() {
    let income = parseFloat(document.getElementById('annual-income').value);
    saveIncomeState(income);
    if (isNaN(income)) {
        document.getElementById('tax-result').textContent = 'Please enter a valid income.';
        return;
    }

    // Calculate pre-tax deductions
    const { cpp, ei, rrsp } = calculateDeductions(income, deductions);
    const totalDeductions = cpp + ei + rrsp;
    income -= totalDeductions; // Adjust income after deductions

    // Calculate taxes
    const { tax: federalTax, marginalRate: federalMarginalRate } = calculateProgressiveTax(income, federalTaxBrackets);
    const { tax: bcTax, marginalRate: bcMarginalRate } = calculateProgressiveTax(income, bcTaxBrackets);
    
    // Calculate total tax and net income
    const totalTax = federalTax + bcTax;
    const netIncome = income - totalTax;
    const averageTaxRate = totalTax / income;
    const marginalTaxRate = federalMarginalRate + bcMarginalRate;

    const takeHomeMonthly = netIncome / 12;

    // Display results
    document.getElementById('tax-result').innerHTML = `
        <p>CPP Deduction: $${cpp.toFixed(2)}</p>
        <p>EI Deduction: $${ei.toFixed(2)}</p>
        <p>RRSP Deduction: $${rrsp.toFixed(2)}</p>
        <p>Federal Tax: $${federalTax.toFixed(2)}</p>
        <p>BC Tax: $${bcTax.toFixed(2)}</p>
        <p>Total Tax: $${totalTax.toFixed(2)}</p>
        <p>Average Tax Rate: ${(averageTaxRate * 100).toFixed(2)}%</p>
        <p><strong>Marginal Tax Rate: <a id='marginal-tax-rate'>${(marginalTaxRate * 100).toFixed(2)}</a>%</strong></p>
        <p><strong>Take Home Money: $${netIncome.toFixed(2)}</strong></p>
        <p><strong>Take Home Money per Month: $<a id='take-home-money'>${takeHomeMonthly.toFixed(2)}</a></strong></p>
    `;
}

// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################
// ######################################################################################################

function calculateCashflow() {
    const savingsElement = document.getElementById('savings');
    const savings = savingsElement ? parseFloat(savingsElement.value) : 0;
    const mortgageTableRows = document.getElementById('mortgage-result').querySelectorAll('tbody tr');
    const cashflowResultsElement = document.getElementById('cashflow-result').querySelector('tbody');
    const takeHomeMoney = document.getElementById('take-home-money').text
    const marginalTaxRate = document.getElementById('marginal-tax-rate').text
    cashflowResultsElement.innerHTML = ''; // Clear previous results
  
    mortgageTableRows.forEach((row) => {
      const downPaymentRate = row.cells[0].textContent;
      const downPayment = parseFloat(row.cells[1].textContent.replace(/[^0-9.-]+/g, ""));
      const loanAmount = parseFloat(row.cells[2].textContent.replace(/[^0-9.-]+/g, ""));
      const interestRate = parseFloat(row.cells[3].textContent.replace(/[^0-9.-]+/g, ""));
      const amortizationPeriod = row.cells[4].textContent;
      const monthlyPayment = parseFloat(row.cells[6].textContent.replace(/[^0-9.-]+/g, ""));
      const swappedAmount = savings - downPayment > 0 ? savings - downPayment : 0;
      const tdInterest = swappedAmount * (interestRate / 100);
      
  
      cashflowResultsElement.innerHTML += `
        <tr>
          <td>$${(takeHomeMoney - monthlyPayment).toFixed(2)}</td>
          <td>$${(marginalTaxRate / 100 * tdInterest / 12).toFixed(2)}</td>
        </tr>
      `;
    });
  }
  
  // Function to highlight rows across all tables
function highlightRows(rowIndex) {
    // Get all tables with the 'highlightable' class
    const tables = document.querySelectorAll('.highlightable');
    tables.forEach((table) => {
      // Remove existing highlights
      table.querySelectorAll('tr').forEach((row) => {
        row.classList.remove('highlight');
      });
      // Add highlight to the corresponding row
      const rowToHighlight = table.querySelectorAll('tr')[rowIndex + 1]; // +1 to account for the header row
      if (rowToHighlight) {
        rowToHighlight.classList.add('highlight');
      }
    });
  }
  