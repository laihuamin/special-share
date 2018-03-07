function parse (tokens) {
    // 位置暂存栈，用于支持很多时候需要返回到某个之前的位置
    const stashStack = [];
    let i = -1;     // 用于标识当前遍历位置
    let curToken;   // 用于记录当前符号

    // 暂存当前位置  
    function stash () {
        stashStack.push(i);
    }
      // 往后移动读取指针
    function nextToken () {
        i++;
        curToken = tokens[i] || { type: 'EOF' };;
    }

    function parseFalse () {
      // 解析失败，回到上一个暂存的位置
      i = stashStack.pop();
      curToken = tokens[i];
    }

    function parseSuccess () {
      // 解析成功，不需要再返回
      stashStack.pop();
    }
  
    const ast = {
        type: 'Program',
        body: [],
        sourceType: "script"
    };

  // 读取下一个语句
  function nextStatement () {
    // 暂存当前的i，如果无法找到符合条件的情况会需要回到这里
    stash();
    
    // 读取下一个符号
    nextToken();

    if (curToken.type === 'identifier' && curToken.value === 'if') {
      // 解析 if 语句
      const statement = {
        type: 'IfStatement',
      };
      // if 后面必须紧跟着 (
      nextToken();
      if (curToken.type !== 'Punctuator' || curToken.value !== '(') {
        throw new Error('Expected ( after if');
      }

      // 后续的一个表达式是 if 的判断条件
      statement.test = nextExpression();

      // 判断条件之后必须是 )
      nextToken();
      if (curToken.type !== 'Punctuator' || curToken.value !== ')') {
        throw new Error('Expected ) after if test expression');
      }

      // 下一个语句是 if 成立时执行的语句
      statement.consequent = nextStatement();

      // 如果下一个符号是 else 就说明还存在 if 不成立时的逻辑
      if (curToken === 'identifier' && curToken.value === 'else') {
        statement.alternative = nextStatement();
      } else {
        statement.alternative = null;
      }
      parseSuccess();
      return statement;
    }
    // 如果是花括号的代码块
    if (curToken.type === 'Punctuator' && curToken.value === '{') {
      // 以 { 开头表示是个代码块
      const statement = {
        type: 'BlockStatement',
        body: [],
      };
      while (i < tokens.length) {
        // 检查下一个符号是不是 }
        stash();
        nextToken();
        if (curToken.type === 'Punctuator' && curToken.value === '}') {
          // } 表示代码块的结尾
          parseSuccess();
          break;
        }
        // 还原到原来的位置，并将解析的下一个语句加到body
        parseFalse();
        statement.body.push(nextStatement());
      }
      // 代码块语句解析完毕，返回结果
      parseSuccess();
      return statement;
    }
    
    // 没有找到特别的语句标志，回到语句开头
    parseFalse();

    // 尝试解析单表达式语句
    const statement = {
      type: 'ExpressionStatement',
      expression: nextExpression(),
    };
    if (statement.expression) {
      nextToken();
      return statement;
    }
  }

  // 读取下一个表达式
  function nextExpression () {
    nextToken();
    if (curToken.type === 'identifier' && curToken.value === 'var') {
      // 如果是定义var      
        const variable = {
          type: 'VariableDeclaration',
          declarations: [],
          kind: curToken.value
        };
        stash();
        nextToken();
        // 如果是分号就说明单句结束了
        if(curToken.type === 'Punctuator' && curToken.value === ';') {
          parseSuccess();
          throw new Error('error');
        } else {
          // 循环
          while (i < tokens.length) {
            if(curToken.type === 'identifier') {
              variable.declarations.id = {
                type: 'Identifier',
                name: curToken.value
              }
            }
            if(curToken.type === 'Punctuator' && curToken.value === '=') {
              nextToken();
              variable.declarations.init = {
                type: 'Literal',
                name: curToken.value
              }
            }
            nextToken();
            // 遇到;结束
            if (curToken.type === 'Punctuator' && curToken.value === ';') {
              break;
            }
          }
        }
        parseSuccess();
        return variable;
    }
      // 常量表达式    
    if (curToken.type === 'number' || curToken.type === 'string') {
      const literal = {
        type: 'Literal',
        value: eval(curToken.value),
      };
      // 但如果下一个符号是运算符
      // 此处暂不考虑多个运算衔接，或者有变量存在
      stash();
      nextToken();
      if (curToken.type === 'operator') {
        parseSuccess();
        return {
          type: 'BinaryExpression',
          operator: curToken.value,
          left: literal,
          right: nextExpression(),
        };
      }
      parseFalse();
      return literal;
    }

    if (curToken.type !== 'EOF') {
      throw new Error('Unexpected token ' + curToken.value);
    }
  }


  // 逐条解析顶层语句
  while (i < tokens.length) {
    const statement = nextStatement();
    if (!statement) {
      break;
    }
    ast.body.push(statement);
  }
  return ast;
}

const ast = parse(
  [ { type: 'identifier', value: 'if' },
  { type: 'Punctuator', value: '(' },
  { type: 'number', value: '1' },
  { type: 'operator', value: '>' },
  { type: 'number', value: '0' },
  { type: 'Punctuator', value: ')' },
  { type: 'Punctuator', value: '{' },
  { type: 'identifier', value: 'var' },
  { type: 'identifier', value: 'a' },
  { type: 'Punctuator', value: '=' },
  { type: 'number', value: '1' },
  { type: 'Punctuator', value: ';' },
  { type: 'Punctuator', value: '}' } ]);

console.log(JSON.stringify(ast));