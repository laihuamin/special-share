function tokenCode(code) {
    const tokens = [];
    //字符串的循环
    for(let i = 0; i < code.length; i++) {
        let currentChar = code.charAt(i);
        //是分号括号的情况
        if (currentChar === ';' || currentChar === '(' || currentChar === ')' || currentChar === '}' || currentChar === '{' || currentChar === '.' || currentChar === '=') {
            // 对于这种只有一个字符的语法单元，直接加到结果当中
            tokens.push({
              type: 'Punctuator',
              value: currentChar,
            });
            continue;
        }
        //是运算符的情况
        if (currentChar === '>' || currentChar === '<' || currentChar === '+' || currentChar === '-') {
            // 与上一步类似只是语法单元类型不同
            tokens.push({
              type: 'operator',
              value: currentChar,
            });
            continue;
        }      
        //是双引号或者单引号的情况
        if (currentChar === '"' || currentChar === '\'') {
            // 引号表示一个字符传的开始
            const token = {
              type: 'string',
              value: currentChar,       // 记录这个语法单元目前的内容
            };
            tokens.push(token);
      
            const closer = currentChar;
      
            // 进行嵌套循环遍历，寻找字符串结尾
            for (i++; i < code.length; i++) {
              currentChar = code.charAt(i);
              // 先将当前遍历到的字符无条件加到字符串的内容当中
              token.value += currentChar;
              if (currentChar === closer) {
                break;
              }
            }
            continue;
          }
        if (/[0-9]/.test(currentChar)) {
            // 数字是以0到9的字符开始的
            const token = {
              type: 'number',
              value: currentChar,
            };
            tokens.push(token);
      
            for (i++; i < code.length; i++) {
              currentChar = code.charAt(i);
              if (/[0-9\.]/.test(currentChar)) {
                // 如果遍历到的字符还是数字的一部分（0到9或小数点）
                // 这里暂不考虑会出现多个小数点以及其他进制的情况
                token.value += currentChar;
              } else {
                // 遇到不是数字的字符就退出，需要把 i 往回调，
                // 因为当前的字符并不属于数字的一部分，需要做后续解析
                i--;
                break;
              }
            }
            continue;
          }
      
          if (/[a-zA-Z\$\_]/.test(currentChar)) {
            // 标识符是以字母、$、_开始的
            const token = {
              type: 'identifier',
              value: currentChar,
            };
            tokens.push(token);
      
            // 与数字同理
            for (i++; i < code.length; i++) {
              currentChar = code.charAt(i);
              if (/[a-zA-Z0-9\$\_]/.test(currentChar)) {
                token.value += currentChar;
              } else {
                i--;
                break;
              }
            }
            continue;
          }
          
          if (/\s/.test(currentChar)) {
            // 连续的空白字符组合到一起
            const token = {
              type: 'whitespace',
              value: currentChar,
            };      
            // 与数字同理
            for (i++; i < code.length; i++) {
              currentChar = code.charAt(i);
              if (/\s]/.test(currentChar)) {
                token.value += currentChar;
              } else {
                i--;
                break;
              }
            }
            continue;
          }
          throw new Error('Unexpected ' + currentChar);
        }
    return tokens;
}

const c = tokenCode(`if(1 > 0) {
  var a = 1;
}`);
console.log(c)