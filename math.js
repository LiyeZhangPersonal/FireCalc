function computeAnnualAssets({
    starting_asset,
    spending_input,
    years_since_start,
    mortgage,
    years_left_on_mortgage,
    children_info,
    assets_stock,
    assets_bonds,
    stock_return,
    bond_return,
    t_bill_return,
    CPI_since_start
}) {
    console.log('--- computeAnnualAssets ---');
    console.log('Input values:', {
        starting_asset,
        spending_input,
        years_since_start,
        mortgage,
        years_left_on_mortgage,
        children_info,
        assets_stock,
        assets_bonds,
        stock_return,
        bond_return,
        t_bill_return,
        CPI_since_start
    });

    if (isNaN(starting_asset)) {
        console.error('Invalid starting asset value:', starting_asset);
        return NaN;
    }
    if (isNaN(spending_input)) {
        console.error('Invalid spending input value:', spending_input);
        return NaN;
    }
    if (isNaN(mortgage)) {
        console.error('Invalid mortgage value:', mortgage);
        return NaN;
    }
    if (isNaN(CPI_since_start)) {
        console.error('Invalid CPI since start value:', CPI_since_start);
        return NaN;
    }

    let child_care_spending = 0;
    children_info.forEach(child => {
        if (years_since_start <= (18 - child.age)) {
            child_care_spending += child.annual_expense;
        }
    });

    console.log('Child care spending:', child_care_spending);
    console.log('spending_input:', spending_input);
    console.log('mortgage:', mortgage);
    console.log('CPI_since_start:', CPI_since_start);

    let core_spending = (spending_input - mortgage - child_care_spending) * CPI_since_start;
    console.log('Core spending:', core_spending);

    let mortgage_spending = years_left_on_mortgage > 0 ? mortgage : 0;
    console.log('Mortgage spending:', mortgage_spending);

    let total_spending = core_spending + mortgage_spending + (child_care_spending * CPI_since_start);
    console.log('Total spending:', total_spending);

    let remaining_assets = starting_asset - total_spending;
    console.log('Remaining assets:', remaining_assets);

    let stock_assets = remaining_assets * (assets_stock / 100);
    let bond_assets = remaining_assets * (assets_bonds / 100);
    let t_bill_assets = remaining_assets * (100 - assets_stock - assets_bonds) / 100;
    console.log('Asset allocations:', { stock_assets, bond_assets, t_bill_assets });

    let total_returns = stock_assets * stock_return +
                        bond_assets * bond_return +
                        t_bill_assets * t_bill_return;
    console.log('Total returns:', total_returns);

    let ending_assets = remaining_assets + total_returns;
    console.log('Ending assets:', ending_assets);

    return ending_assets;
}
