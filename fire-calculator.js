document.getElementById('children').addEventListener('input', function (event) {
    const numberOfChildren = event.target.value;
    const childrenDetailsDiv = document.getElementById('children-details');
    childrenDetailsDiv.style.display = numberOfChildren > 0 ? 'block' : 'none';

    const existingChildGroups = childrenDetailsDiv.querySelectorAll('.child-group');
    existingChildGroups.forEach(group => group.remove());

    for (let i = 1; i <= numberOfChildren; i++) {
        const childGroup = document.createElement('div');
        childGroup.className = 'child-group';

        const ageLabel = document.createElement('label');
        ageLabel.textContent = `Child ${i} Age`;
        const ageInput = document.createElement('input');
        ageInput.type = 'number';
        ageInput.name = `child-age-${i}`;
        ageInput.required = true;

        const expenseLabel = document.createElement('label');
        expenseLabel.textContent = `Child ${i} Annual Child Care Expenses`;
        const expenseInput = document.createElement('input');
        expenseInput.type = 'number';
        expenseInput.name = `child-expense-${i}`;
        expenseInput.required = true;

        childGroup.appendChild(ageLabel);
        childGroup.appendChild(ageInput);
        childGroup.appendChild(expenseLabel);
        childGroup.appendChild(expenseInput);

        childrenDetailsDiv.appendChild(childGroup);
    }
});

document.getElementById('fire-calculator').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('Form submitted');

    const startingAsset = parseFloat(document.getElementById('assets').value);
    const spendingInput = parseFloat(document.getElementById('spending').value);
    const mortgage = parseFloat(document.getElementById('mortgage').value);
    const yearsLeftOnMortgage = parseInt(document.getElementById('years-mortgage').value);
    const childrenCount = parseInt(document.getElementById('children').value);
    const assetsStock = parseFloat(document.getElementById('stocks-percentage').value);
    const assetsBonds = parseFloat(document.getElementById('bonds-percentage').value);
    const yearsToProject = parseInt(document.getElementById('years-to-project').value);

    const childrenInfo = [];
    for (let i = 1; i <= childrenCount; i++) {
        const age = parseInt(document.querySelector(`input[name='child-age-${i}']`).value);
        const annualExpense = parseFloat(document.querySelector(`input[name='child-expense-${i}']`).value);
        childrenInfo.push({ age, annual_expense: annualExpense });
    }

    console.log('Inputs:', {
        startingAsset,
        spendingInput,
        mortgage,
        yearsLeftOnMortgage,
        childrenInfo,
        assetsStock,
        assetsBonds,
        yearsToProject
    });

    const { finalAssets, failedYears, successRate } = computeFinalAssetsAndFailures({
        startingAsset,
        spendingInput,
        yearsLeftOnMortgage,
        childrenInfo,
        assetsStock,
        assetsBonds,
        yearsToProject,
        historicalData
    });

    console.log('Results:', { finalAssets, failedYears, successRate });

    document.getElementById('result').innerHTML = `
        <p>Final assets after ${yearsToProject} years: $${finalAssets.toFixed(2)}</p>
        <p>Failed years: ${failedYears.join(', ')}</p>
        <p>Success rate: ${successRate.toFixed(2)}%</p>
    `;
});

function getHistoricalReturns(year, historicalData) {
    return historicalData.find(data => data.year === year);
}

function computeFinalAssetsAndFailures({
    startingAsset,
    spendingInput,
    yearsLeftOnMortgage,
    childrenInfo,
    assetsStock,
    assetsBonds,
    yearsToProject,
    historicalData
}) {
    let failedYears = [];
    let totalYears = historicalData.length - yearsToProject + 1;

    console.log('Starting computation for all periods...');

    for (let i = 0; i < totalYears; i++) {
        let startYear = historicalData[i].year;
        let endingAssets = computeAssetsForPeriod({
            startingAsset,
            spendingInput,
            yearsLeftOnMortgage,
            childrenInfo,
            assetsStock,
            assetsBonds,
            startYear,
            yearsToProject,
            historicalData
        });

        console.log(`Ending assets for period starting in ${startYear}: $${endingAssets.toFixed(2)}`);

        if (endingAssets < 0) {
            failedYears.push(startYear);
        }
    }

    let finalAssets = computeAssetsForPeriod({
        startingAsset,
        spendingInput,
        yearsLeftOnMortgage,
        childrenInfo,
        assetsStock,
        assetsBonds,
        startYear: historicalData[0].year,
        yearsToProject,
        historicalData
    });

    let successRate = ((totalYears - failedYears.length) / totalYears) * 100;

    console.log('Final computation results:', { finalAssets, failedYears, successRate });

    return { finalAssets, failedYears, successRate };
}

function computeAssetsForPeriod({
    startingAsset,
    spendingInput,
    yearsLeftOnMortgage,
    childrenInfo,
    assetsStock,
    assetsBonds,
    startYear,
    yearsToProject,
    historicalData
}) {
    let assets = startingAsset;
    let yearsLeftOnMortgageLocal = yearsLeftOnMortgage;
    let yearsSinceStart = 0;

    const baseCPI = getHistoricalReturns(startYear, historicalData).CPI;

    for (let i = 0; i < yearsToProject; i++) {
        const currentYear = startYear + i;
        const returns = getHistoricalReturns(currentYear, historicalData);

        if (!returns) {
            console.error(`No data available for year ${currentYear}`);
            break;
        }

        const { stock_return, bond_return, t_bill_return, CPI } = returns;
        const normalizedCPI = CPI / baseCPI;

        assets = computeAnnualAssets({
            starting_asset: assets,
            spending_input: spendingInput,
            years_since_start: yearsSinceStart,
            mortgage: mortgage,
            years_left_on_mortgage: yearsLeftOnMortgageLocal,
            children_info: childrenInfo,
            assets_stock: assetsStock,
            assets_bonds: assetsBonds,
            stock_return: stock_return,
            bond_return: bond_return,
            t_bill_return: t_bill_return,
            CPI_since_start: normalizedCPI
        });

        console.log(`Year ${currentYear}:`, { assets });

        yearsSinceStart++;
        yearsLeftOnMortgageLocal--;
    }

    return assets;
}
