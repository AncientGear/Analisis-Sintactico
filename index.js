var text = "";
var tokensTxt = [];
var tokens = [];
var errores = [];
var codigoUsuario = [];
var variableRegEx = /^[a-zA-Z][\w$]*/;
var numerosRegEx = /[\d]*[.]*[\d]*/;
var aritmeticosRegEx = /^[+-\/\*]/
var mensajesError = {
    TD: 'Tipo de dato incorrecto',
    OA: 'Operador Incorrecto',
    OR: 'Operador Incorrecto',
    ID: 'Identificador Incorrecto',
    CNE: 'Numero Inválido',
    AS: 'Operador de Asignatcion inválido',
    SEP: 'Cáracter Inválido',
    DEL: 'Delimitador Inválido',
    IC: 'Condicional Inválida',
    IR: 'Condicional Inválida'
}
var tokensPosibles = {
    
}

function descargar() {
    const elemento = document.getElementById('descargar');
    
    elemento.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
}

function iniciar() {
    analizar();
}

async function analizar() {
    this.text = "";
    this.tokens = [];
    this.errores = [];
    this.tokensPosibles = {
        tiposDatos: {
            id: 'TD',
            opciones: ['int', 'float', 'void', 'char'],
            contador: 0
        },
        operadorAritmetico: {
            id: 'OA',
            opciones: ['+', '-', '*', '/'],
            contador: 0
        },
        delimitadores: {
            id: 'DEL',
            opciones: ['{', '}', '(', ')', '[', ']'],
            contador: 0
        },
        miscelaneos: {
            id: 'SEP',
            opciones: [',', ';', ':'],
            contador: 0
        },
        asignacion: {
            id: 'AS',
            opciones: ['='],
            contador: 0
        },
        identificador: {
            id: 'ID',
            contador: 0,
            opciones: []
        }
    }
    this.tokensTxt = [];
    
    codigoUsuario = document.getElementById('codigo').value;
    codigoUsuario = codigoUsuario.split('\n').filter(Boolean);
    
    let linea = 1;
    
    for(let i = 0; i < codigoUsuario.length; i++){
        let codigo = codigoUsuario.shift();
        let comparar = '';
        
        if(codigo.match(/^[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬]+[ ]*=[ ]*[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬,;-]*/)) {
            codigo = codigo.replace(/[ ]/g, '');
            
            comparar = codigo.match(/^[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬-]+/)[0];
            codigo = codigo.replace(comparar, '');

            if(comparar.match(variableRegEx)) {
                await generarToken(comparar, 'identificador', linea, true);
            } else{
                await generarToken(comparar, 'identificador', linea);
            }

            comparar = codigo.match(/^[\a-zA-Z0-9$_(){}["!#%&?'¡¿*΅~^`<>|°¬-]*=/)[0];
            if(comparar === '=') {
                await generarToken(comparar, 'asignacion', linea);
            } else{
                await generarToken('', 'asignacion', linea);
            }
            codigo = codigo.replace(comparar, '');

            while(codigo.match(/[\w$_(){}["!#%&\/?='¡¿*΅~^`<>|°¬,;-]+/)) {
                comparar = codigo.match(/[\w$_(){}["\.!#%&?'¡¿΅~^`<>|°¬]+/)[0];
                codigo = codigo.replace(comparar, '');

                if(Number(comparar)) {
                    if(comparar.match(numerosRegEx)) {
                        await generarToken(comparar, 'identificador', linea, true);
                    } else{
                        await generarToken(comparar, 'identificador', linea);
                    }
                } else{
                    if(comparar.match(variableRegEx)) {
                        await generarToken(comparar, 'identificador', linea, true);
                    } else{
                        await generarToken(comparar, 'identificador', linea);
                    }
                }
            
                if(codigo.length === 0 || codigo.length === 1) {
                    comparar = codigo.match(/./)[0];
                    await generarToken(comparar, 'miscelaneos', linea);
                    break;
                }
    
                if(codigo.length > 1) {
                    comparar = codigo.match(/[+-/*]+/)[0];
                    codigo = codigo.replace(comparar, '')
                    if(comparar.length === 1 && comparar.match(aritmeticosRegEx)) {
                        await generarToken(comparar, 'operadorAritmetico', linea);
                    } else{
                        await generarToken(comparar, 'operadorAritmetico', linea);
                    }
                }
    
                if(codigo.length === 0 || codigo.length === 1) {
                    comparar = codigo.match(/./)[0];
                    await generarToken(comparar, 'miscellaneous', linea);
                    break;
                }
            }

        }
        else if(codigo.match(/^[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬]+[ ]+[\w$_(){}["!#%&\/?'¡¿*΅~^`<>|°¬]+/) && codigo.length > 1) {
            comparar = codigo.match(/^[\w$_(){},["!#%&\/?'¡¿*΅~^`<>|°¬]+/)[0];
            codigo = codigo.replace(comparar, '');
            
            await generarToken(comparar, 'tiposDatos', linea);

            codigo = codigo.replace(/^\s/, '');
            
            comparar = codigo.match(/^[\w$_”["!#%,&?'¡¿*΅~^`<>|°¬]+/)[0];
            codigo = codigo.replace(comparar, '');
            
            if(comparar.match(/^[\w][\w$]*/)){
                await generarToken(comparar, 'identificador', linea, true);
            } else {
                await generarToken(comparar, 'identificador', linea, false);
            }

            
            comparar = codigo.match(/^./)[0];
            codigo = codigo.replace(comparar, '');
            console.log(comparar);
            console.log(codigo);
            
            if(comparar === '(') {
                await generarToken("(", 'delimitadores', linea);
            } else {
                await generarToken('', 'delimitadores', linea);
            }
            console.log(codigo);
            
            while(codigo.match(/[\w$_(){}["!#%&\/?='¡¿*΅~^`<>|°¬,;-]+/) && codigo.length > 1){
                
                comparar = codigo.match(/^[\w$_["!#%&\/?'¡¿*΅~^`<>|°¬]+/)[0];
                codigo = codigo.replace(comparar, '');

                await generarToken(comparar, 'tiposDatos', linea);

                codigo = codigo.replace(/^\s/, '');

                if(codigo.length === 1) {
                    break;
                }
                
                comparar = codigo.match(/^[\w$_["!#%&\/?'¡¿*΅~^`<>|°¬]+/)[0];
                const aux = comparar.split('');
                if(aux[aux.length - 1] === ','){
                    comparar = comparar.slice(0, -1);
                }
                codigo = codigo.replace(comparar, '');

                await generarToken(comparar, 'identificador', linea, true);

                comparar = codigo.match(/^./)[0];
                
                if(comparar === ','){
                    await generarToken(comparar, 'miscelaneos', linea);
                    codigo = codigo.replace(comparar, '');
                    codigo = codigo.replace(/^\s/, '');
                }
            }

            if(codigo === ')') {
                await generarToken(")", 'delimitadores', linea);
            } else {
                await generarToken('', 'delimitadores', linea);
            }
            
        } else if(codigo.length === 1) {
            comparar = codigo.match(/^./)[0] || codigo.match(/^./)[0];
            if(comparar === '{' || comparar === '}') {
                await generarToken(comparar, 'delimitadores', linea);
            } else{
                await generarToken(comparar, 'delimitadores', linea);
            }
        }
        tokensTxt.push('\n');
        linea++;
        i--;
    }   
    
    text = tokensTxt.join(' ');

    descargar();
    generarTablaTokens();
    generarTablaErrores();
}

function generarTablaTokens(){
    
    const elemento = document.getElementById('tablaTokens');

    let tabla = "<table><thead><tr><th>#</th><th>Lexema</th><th>Token</th></tr></thead><tbody>"

    for(let i = 0; i < tokens.length; i++) {
        tabla += `<tr><th>${i+1}</th>`
        tabla += `<td>${tokens[i].lexema}</td>`
        tabla += `<td>${tokens[i].token}</td></tr>`
    }
    tabla += '</tbody></table>';
    elemento.innerHTML = tabla;
}

function generarTablaErrores() {
    const elemento = document.getElementById('tablaErrores');
    let tabla = ` <table>
    <thead>
        <tr>
            <th>Linea</th>
            <th>Lexema</th>
            <th>Token de Error</th>
            <th>Descripción</th>
        </tr>
    </thead>
    <tbody class="infoErrores">`;

    for(let i = 0; i < errores.length; i++) {
        tabla += `<tr><th>${errores[i].linea}</th>`
        tabla += `<td>${errores[i].lexema}</td>`
        tabla += `<td>${errores[i].token}</td>`
        tabla += `<td>${errores[i].mensaje}</td></tr>`
    }
    tabla += '</tbody></table>';
    elemento.innerHTML = tabla;
}

async function generarToken(lexema, codigo, linea, aceptar) {
    
    const opcion = tokensPosibles[`${codigo}`];
    
    let tokenNuevo = {};
    if(aceptar === undefined) {
        aceptar = false;
    }
    
    const existe = await verificarExistenciaToken(lexema);

    opcion.contador++;

    if(existe !== false) {
        tokensTxt.push(tokens[existe].token);
    }else{
        if(opcion.opciones.indexOf(lexema) !== -1 || aceptar === true){
            tokenNuevo = {
                linea: linea,
                lexema: lexema,
                token: `${opcion.id}${opcion.contador}`
            }
            
            this.tokensTxt.push(`${opcion.id}${opcion.contador}`);
            
        } else{
            tokenNuevo = {
                linea,
                lexema,
                token: `ERR${opcion.id}${opcion.contador}`,
            }
            tokenNuevo.mensaje = mensajesError[`${opcion.id}`]
            errores.push(tokenNuevo);
            tokensTxt.push(`ERR${opcion.id}${opcion.contador}`);
        }
        if(JSON.stringify(tokenNuevo) !== '{}'){
            tokens.push(tokenNuevo);
        }
    }

}

function verificarExistenciaToken(lexema) {
    let encontrado = false;

    for(let i = 0; i < tokens.length; i++) {
        
        if(tokens[i].lexema === lexema) {
            return i;
        }
    }

    return encontrado;
}

function verificarExistenciaError(token) {
    let encontrado = false;

    return encontrado;
}