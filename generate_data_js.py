import csv

input_file = 'Returns.csv'
output_file = 'data.js'

with open(input_file, mode='r') as file:
    csv_reader = csv.DictReader(file)
    historical_data = []

    for row in csv_reader:
        year = int(row['Year'])
        stock_return = float(row['stock_returns'].strip('%')) / 100
        bond_return = float(row['bond_returns'].strip('%')) / 100
        t_bill_return = float(row['bill_returns'].strip('%')) / 100
        CPI = float(row['CPI'])
        historical_data.append({
            'year': year,
            'stock_return': stock_return,
            'bond_return': bond_return,
            't_bill_return': t_bill_return,
            'CPI': CPI
        })

with open(output_file, mode='w') as file:
    file.write('const historicalData = ')
    file.write(str(historical_data).replace("'", ""))
    file.write(';')
