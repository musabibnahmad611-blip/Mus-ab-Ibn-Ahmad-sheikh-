// Simple calculator logic
document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('display');
  const keys = document.getElementById('keys');

  let expression = '';

  // helpers
  const updateDisplay = (text) => {
    display.value = text === '' ? '0' : text;
  };

  const clearAll = () => {
    expression = '';
    updateDisplay('0');
  };

  const backspace = () => {
    expression = expression.slice(0, -1);
    updateDisplay(expression || '0');
  };

  const append = (val) => {
    // Prevent multiple leading zeros
    if (expression === '0' && val !== '.' ) expression = '';
    expression += val;
    updateDisplay(expression);
  };

  const sanitize = (expr) => {
    // allow only digits, operators, parentheses, dot and percent and spaces
    if (/[^0-9+\-*/().% ]/.test(expr)) throw new Error('Invalid characters');
    return expr;
  };

  const evaluateExpression = (expr) => {
    if (!expr)  '';
    // convert percent: replace 'number%' with '(number//100)'
    // A simple replacement: replace all occurrences of n% with (n/100)
    expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
    expr = sanitize(expr);
    // Use Function for evaluation (simple and okay for local calculator)
    // Wrap in try/catch to handle bad expressions
    try {
      // Avoid accidental global access by not allowing identifiers
      const result = Function('"use strict"; return (' + expr + ')')();
      if (result === Infinity || result === -Infinity) throw new Error('Division by zero');
      return Number.isFinite(result) ? String(result) : '';
    } catch (e) {
      throw e;
    }
  };

  // button clicks
  keys.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const val = btn.dataset.value;
    const action = btn.dataset.action;

    if (action === 'clear') {
      clearAll();
      return;
    }
    if (action === 'back') {
      backspace();
      return;
    }
    if (action === 'equals') {
      try {
        const res = evaluateExpression(expression);
        expression = res;
        updateDisplay(expression || '0');
      } catch (err) {
        updateDisplay('Error');
        expression = '';
        setTimeout(() => updateDisplay('0'), 900);
      }
      return;
    }
    // default: append a value (digit, operator, . or %)
    if (typeof val !== 'undefined') {
      // simple guard: don't allow two operators in a row (except minus for negative)
      const last = expression.slice(-1);
      const ops = '+-*/';
      if (ops.includes(val)) {
        if (expression === '' && val !== '-') return; // don't start with +*/ 
        if (ops.includes(last) && !(val === '-' && last !== '-')) {
          // replace last operator with new one
          expression = expression.slice(0, -1);
        }
      }
      append(val);
    }
  });

  // keyboard support
  document.addEventListener('keydown', (e) => {
    const allowed = '0123456789+-*/().%';
    if (allowed.includes(e.key)) {
      e.preventDefault();
      append(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      try {
        const res = evaluateExpression(expression);
        expression = res;
        updateDisplay(expression || '0');
      } catch {
        updateDisplay('Error');
        expression = '';
        setTimeout(() => updateDisplay('0'), 900);
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      backspace();
    } else if (e.key.toLowerCase() === 'c') {
      // clear on 'c'
      e.preventDefault();
      clearAll();
    }
  });

  // initialize
  clearAll();
});

