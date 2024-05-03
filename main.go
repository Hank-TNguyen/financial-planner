package main

import (
	"strconv"

	"github.com/rivo/tview"
)

// Define federal tax brackets and rates
var federalTaxBrackets = []float64{53359, 106717, 165430, 235675}
var federalTaxRates = []float64{0.15, 0.205, 0.26, 0.29, 0.33}

// Define British Columbia tax brackets and rates
var bcTaxBrackets = []float64{45654, 91310, 104835, 127299, 172602, 240716}
var bcTaxRates = []float64{0.0506, 0.077, 0.105, 0.1229, 0.147, 0.168, 0.205}

// Define CPP contribution rates
const baseCPPRate = 0.0495
const additionalCPPRate = 0.01
const rrspContributionRate = 0.03
const taxCreditRate = 0.15

// ... (rest of your code)

func main() {
	app := tview.NewApplication()

	// Create the main layout and add both forms to it.
	flex := tview.NewFlex()

	// Create the tax calculator form.
	taxForm := tview.NewForm().
		AddInputField("Annual Income", "", 20, nil, nil)

	calculateTaxHandler := func() {
		// Get the input value.
		incomeStr := taxForm.GetFormItemByLabel("Annual Income").(*tview.InputField).GetText()

		// Convert input value to a number.
		income, err := strconv.ParseFloat(incomeStr, 64)
		if err != nil {
			// Display an error message if the input is not a valid number.
			_showModal(app, flex, "Invalid income. Please enter a valid number.")
			return
		}

		// Calculate taxes, RRSP contribution, and CPP contributions.
		federalTax, provincialTax, rrsp, cpp := CalculateTax(income)

		// Calculate the total tax and take-home income.
		totalTax := federalTax + provincialTax
		takeHomeIncome := income - totalTax - rrsp - cpp

		// Calculate the marginal tax rate.
		marginalRate := calculateMarginalRate(income, federalTaxBrackets, federalTaxRates) +
			calculateMarginalRate(income, bcTaxBrackets, bcTaxRates)

		// Display the results.
		resultMessage := "Marginal Tax Rate: " + strconv.FormatFloat(marginalRate*100, 'f', 2, 64) + "%\n" +
			"Take-Home Income: $" + strconv.FormatFloat(takeHomeIncome, 'f', 2, 64)
		_showModal(app, flex, resultMessage)
	}

	taxForm.AddButton("Calculate Tax", calculateTaxHandler)

	// Create the mortgageForm for input.
	mortgageForm := tview.NewForm()
	mortgageForm.AddInputField("House Price", "", 20, nil, nil).
		AddInputField("Down Payment", "", 20, nil, nil).
		AddButton("Calculate", func() {
			// Get the input values.
			housePriceStr := mortgageForm.GetFormItemByLabel("House Price").(*tview.InputField).GetText()
			downPaymentStr := mortgageForm.GetFormItemByLabel("Down Payment").(*tview.InputField).GetText()

			// Convert input values to numbers.
			housePrice, err1 := strconv.ParseFloat(housePriceStr, 64)
			downPayment, err2 := strconv.ParseFloat(downPaymentStr, 64)

			// Check for errors.
			if err1 != nil || err2 != nil {
				// Display an error message.
				showModal(app, "Invalid input. Please enter valid numbers.", flex)
				return
			}

			// Perform a simple calculation.
			result := housePrice + downPayment // Replace with actual financial calculations.

			// Display the result.
			showModal(app, "Calculation Result: "+strconv.FormatFloat(result, 'f', 2, 64), flex)
		})

	// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

	flex.AddItem(mortgageForm, 0, 1, true). // The first form takes up half the space.
						AddItem(taxForm, 0, 1, false)

	// Set up the application.
	if err := app.SetRoot(flex, true).Run(); err != nil {
		panic(err)
	}
}

func _showModal(app *tview.Application, flex *tview.Flex, message string) {
	showModal(app, message, flex)
}

// showModal displays a modal dialog with the given message.
func showModal(app *tview.Application, message string, flex *tview.Flex) {
	modal := tview.NewModal().
		SetText(message).
		AddButtons([]string{"Ok"}).
		SetDoneFunc(func(buttonIndex int, buttonLabel string) {
			app.SetRoot(flex, true).Run()
		})
	app.SetRoot(modal, false).Run()
}

// CalculateTax calculates the federal and provincial taxes based on income.
func CalculateTax(income float64) (federalTax, provincialTax, rrsp, cpp float64) {
	// Calculate RRSP contribution
	rrsp = income * rrspContributionRate

	// Calculate CPP contributions
	cppBase := income * baseCPPRate
	cppAdditional := income * additionalCPPRate
	cpp = cppBase + cppAdditional

	// Calculate federal tax
	federalTax = calculateProgressiveTax(income, federalTaxBrackets, federalTaxRates)

	// Calculate provincial tax (British Columbia)
	provincialTax = calculateProgressiveTax(income, bcTaxBrackets, bcTaxRates)

	return federalTax, provincialTax, rrsp, cpp
}

// calculateProgressiveTax calculates tax based on income and progressive tax brackets.
func calculateProgressiveTax(income float64, brackets []float64, rates []float64) float64 {
	var tax float64
	for i, bracket := range brackets {
		if income > bracket {
			previousBracket := 0.0
			if i > 0 {
				previousBracket = brackets[i-1]
			}
			tax += (bracket - previousBracket) * rates[i]
		} else {
			previousBracket := 0.0
			if i > 0 {
				previousBracket = brackets[i-1]
			}
			tax += (income - previousBracket) * rates[i]
			break
		}
	}
	if income > brackets[len(brackets)-1] {
		tax += (income - brackets[len(brackets)-1]) * rates[len(rates)-1]
	}
	return tax
}

// calculateMarginalRate calculates the marginal tax rate based on income and tax brackets.
func calculateMarginalRate(income float64, brackets []float64, rates []float64) float64 {
	for i, bracket := range brackets {
		if income <= bracket {
			return rates[i]
		}
	}
	return rates[len(rates)-1]
}
