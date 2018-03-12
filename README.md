## The Daily Rate Calculator

The Daily Rate Calculator is a Web App based on VueJS 2.x, Bootstrap 4 and JQuery 3.3. You can use it for free without warranty.

It primary answers two questions:
- What daily rate do I have to offer at least for a given number of contracted days to have my tax and costs covered?
- How long to I have to work for a given daily rate to have my tax and costs covered?

It's abstraction allows to be adjusted for different tax models. Currently it just comes with a simplified tax model for Germany consisting of it's three main parts income tax, church tax and solidarity supplement. It is simplified because specialties -- like parts of the social costs can be treated as a kind of business costs -- are not modelled.

For the most cases in Germany that should fit -- and in doubt it creates higher tax costs. That is a safe mode and you better put too much than too less money aside for the fiscal government.

### Data transferred to the server

None, except the standard http protocol data. This tool neither sends any of your input data to the server nor does it collect usage data or uses cookies.

### The technology used

The tool uses JavaScript on client-side for all the calculations. For storing information it uses the [Web API LocalStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage)

### Formulas used

The following two formulas seem trivial but they should be mentioned for a clear view.

```
total brutto costs = (∑ monthly expenses - ∑ monthly income) + ∑ social costs
```

**At that point, trivial might not be trivial: the monthly income is meant to be netto income, i.e. tax already substracted, so that they even out the netto expenses.**

```
costs due to order =
  ∑ one-time order costs
+ ∑ monthly order costs * contract duration
+ ∑ per-day order costs * days to be ordered
```

#### Mode "Daily Rate"
```
Daily Rate = (costs due to order + total brutto costs) / days to be ordered
Hourly Rate = Daily Rate / 8
```

#### Mode "Days to be ordered"
```
Days to be ordered =
(  total brutto costs
 + ∑ one-time order costs
 + ∑ monthly order costs * contract duration
) / (daily rate - ∑ per-day order costs)

Hours to be ordered = Days to be ordered / 8
```

#### Tax Suggestion

The tax suggestion is based on the German Tax law, especially [§32a EStG](https://www.gesetze-im-internet.de/estg/__32a.html), and based on the yearly revenue.

```
yearly revenue = total brutto costs * 12
```

**This is the point where it becomes a bit fuzzy, because your income might vary from project to project.**
A solution to this could be to take your yearly revenue * 1.5 or * 1.75. On the other hand, you could add a monthly "expense" to raise your monthly needed income. That raises your daily rate on the one hand, but also gives you freedom to save some money for future use.

In the above mentioned paragraph three variables are introduced and defined as following:

```
let x = floor(yearly revenue)
let y = floor(yearly revenue -  9000.00) / 10000
let z = floor(yearly revenue - 13996.00) / 10000
```

In the following step the absolute (to be paid) tax is calculated. This calculation is devided into 5 different rates.

```
if yearly revenue < 9000.00 then
  absolute income tax = 0
  
if   9000.00 < yearly revenue <=  13996.00 then
  absolute income tax = (997.8 * y + 1400) * y
  
if  13996.00 < yearly revenue <=  54949.00 then
  absolute income tax = (220.13 * z + 2397) * z + 948.49

if  54949.00 < yearly revenue <= 260532.00 then
  absolute income tax = 0.42 * x - 8621.75

if 260532.00 < yearly revenue then
  absolute income tax = 0.45 * x - 16437.7
  
relative income tax = absolute income tax / yearly revenue
```

These formulas are given by §32a EStG -- so please don't ask me, why a specific constant is used.

Then there are the church tax and the solidarity supplement. These are relative, but not to the yearly revenue but to the actual absolute income tax. In other words, church tax and solidarity supplement are relatively added to the income tax. 

So the following formula gives us one relative value which is the combined or total tax to be paid. We assume that both, solidarity supplement and church tax, are given in normalized per cent (so a value between 0 and 1).

```
total tax = relative income tax * (1 + solidarity supplement + church tax)
```

**It should be noted that the constants may change with every year in Germany. I will _try_ to keep them updated.** This should be easy, as the constants have their own variable in the source code.

## Online Version
[Daily Rate Calculator](http://tools.cbc-faruhn.com/daily-rate-calculator/)

## Creator / Imprint

Ibrahim-Ben Faruhn

[www.cbc-faruhn.com](http://www.cbc-faruhn.com)  
[hello@cbc-faruhn.com](mailto:hello@cbc-faruhn.com)  
+49 176 29 47 48 87  
  
Müggelseedamm 157  
12587 Berlin  

IBAN: DE57 1101 0100 1000 0004 52  
BIC: SOBKDEBBXXX (solarisBank)  
  
VAT-ID: DE 309 715 667  
