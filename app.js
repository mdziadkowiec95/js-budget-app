// var list = document.querySelectorAll('div');
// alert(list);
// list.forEach(function (current, index) {
//   current.style.display = 'none';
//   console.log(index)
// });
// console.log(list);


// BUDGET CONTROLLER
var budgetController = (function () {

  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;

    data.allItems[type].forEach(function (curEl) {
      sum += curEl.value;
    });

    data.totals[type] = sum;

  }


  var data = {
    allItems: {
      expense: [],
      income: []
    },
    totals: {
      expense: 0,
      income: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }


      // Create new item based on 'income' or 'expense' type
      if (type === 'expense') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'income') {
        newItem = new Income(ID, des, val);
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;
      // debugger;
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {

      // calculate total income and expenses

      calculateTotal('expense');
      calculateTotal('income');
      // calculat the budget (inc - exp)
      data.budget = data.totals.income - data.totals.expense;
      // calculate the procentage of income thaht we spent
      if (data.totals.income > 0) {
        data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
      } else {
        data.percentage = -1;
      }

    },

    calculatePercentages: function () {
      data.allItems.expense.forEach(function (current) {
        current.calcPercentage(data.totals.income);
      });
    },

    getPercentages: function () {

      var allPerc = data.allItems.expense.map(function (current) {
        return current.getPercentage();
      });

      return allPerc;

    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.income,
        totalExp: data.totals.expense,
        percentage: data.percentage
      }
    },
    test: function () {
      console.log(data);
    }
  }


})();


// UI CONTROLLER
var UIController = (function () {

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage'
  }

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // income or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }

      console.log(type);
    },


    addListItem: function (obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder txt

      if (type === 'income') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'expense') {
        element = DOMstrings.expenseContainer;
        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with some actual data

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);
      // Insert the HTML into the DOM

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function (selectorID) {

      var item = document.getElementById(selectorID);
      item.parentNode.removeChild(item);
    },

    clearFields: function () {
      var fields, fieldsArr;

      // get inputs to clear
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      // convert nodeList --> array
      fieldsArr = Array.prototype.slice.call(fields);

      // clear inputs value
      fieldsArr.forEach(function (current, index, array) {
        current.value = '';
      });

      // focus on description input
      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {

      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


      /*  ---- My own solution for looping through nodeList --- */
      /*
      Array.prototype.forEach.call(fields, function (field, index) {
        if (percentages[index] > 0) {
          field.textContent = percentages[index] + ' %';
        } else {
          field.textContent = '---';
        }
      });
      */

      var nodeListForEach = function (list, callback) {

        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }

      };

      nodeListForEach(fields, function (current, index) {

        if (percentages[index] > 0) {
          current.textContent = percentages[index] + ' %';
        } else {
          current.textContent = '---';
        }
      });
    },

    getDOMstrings: function () {
      return DOMstrings;
    }
  };

})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

  var setupEventListeners = function () {

    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function (e) {

      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
  };

  var updatePercentages = function () {

    // calculate percentages
    budgetCtrl.calculatePercentages();
    // read them from the budg et controller
    var percentages = budgetCtrl.getPercentages();
    // update the UI
    UIController.displayPercentages(percentages);
  }

  var updateBudget = function () {

    // 1. calculate the budget
    budgetCtrl.calculateBudget();
    // 2. return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display the budget on UI
    UICtrl.displayBudget(budget);
  }

  var ctrlAddItem = function () {
    var input, newItem;
    // 1.get the field input data

    input = UICtrl.getInput();

    if ((input.description !== "" && !isNaN(input.value) && input.value > 0)) {

      // 2. add item to the budget controller

      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. add the new item to the UI

      UICtrl.addListItem(newItem, input.type);

      // 4. clear fields
      UICtrl.clearFields();

      // 5. calculate and update the budget 
      updateBudget();

      // 6. update percentages

      updatePercentages();

    }
  };

  var ctrlDeleteItem = function (e) {
    // debugger;

    var itemID, splitID, type, ID;

    var itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // delete the item from the data structure

      budgetCtrl.deleteItem(type, ID);

      // delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // update and show the new budget
      updateBudget();

      // upadate percentages

      updatePercentages();
    }

  };


  return {
    init: function () {
      console.log('Application has started');

      // reset budget labels when the Application starts
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });

      setupEventListeners();
    }
  }

})(budgetController, UIController);

controller.init();