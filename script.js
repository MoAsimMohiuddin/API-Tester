import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import prettyBytes from 'pretty-bytes';
import setupEditors from './setupEditor';

const form=document.querySelector('[data-form]');

const queryParamsContainer=document.querySelector('[data-query-params]');
const requestHeadersContainer=document.querySelector('[data-request-headers]');
const responseHeadersContainer=document.querySelector('[data-response-headers]');
const dataResponseBodyContainer=document.querySelector('[data-json-response-body]');
const {requestEditor, updateResponseEditor}=setupEditors();
const keyValueTemplate=document.querySelector('[data-key-value-template]');

document.querySelector('[data-add-query-param-btn]').addEventListener('click', (event)=>{
    console.log("clikcked")
    queryParamsContainer.append(createKeyValuePair());
});

document.querySelector('[data-add-request-header-btn]').addEventListener('click', (event)=>{
    requestHeadersContainer.append(createKeyValuePair());
});

queryParamsContainer.append(createKeyValuePair());
requestHeadersContainer.append(createKeyValuePair());

function createKeyValuePair() {

    const element=keyValueTemplate.content.cloneNode(true);

    element.querySelector('[data-remove-btn]').addEventListener('click', (event)=>{
        event.target.closest('[data-key-value-pair]').remove();
    })

    return element;
};

form.addEventListener('submit', (event)=>{
    event.preventDefault();

    let data;

    try{
        data=JSON.parse(requestEditor.state.doc.toString() || null);
    }catch(err){
        alert("JSON Data is Malformed");
        return;
    }

    axios({
        url: document.querySelector('[data-url]').value,
        method: document.querySelector('[data-method]').value,
        params: keyValuePairsToObjects(queryParamsContainer),
        headers: keyValuePairsToObjects(requestHeadersContainer),
        data,
    }).then((response)=>{
        document.querySelector('[data-response-section]').classList.remove('d-none');

        console.log(response.data);
        updateResponseDetails(response);
        updateResponseEditor(response.data);
        updateResponseHeaders(response.headers);

        console.log("Response.data=");
        console.log(response.data);
        console.log("headers="+response.headers);
    }).catch((err)=>{
        document.querySelector('[data-response-section]').classList.remove('d-none');
        document.querySelector('[data-status]').textContent=err.response.status;
    });
});

function keyValuePairsToObjects(container) {
    const pairs=container.querySelectorAll('[data-key-value-pair]')
    return [...pairs].reduce((data, pair)=>{
        const key=pair.querySelector('[data-key]').value;
        const value=pair.querySelector('[data-value]').value;

        if(key==='') return data;
        return {...data, [key]:value};
    }, {})
};

function updateResponseHeaders(headers) {
    responseHeadersContainer.innerHTML='';

    Object.entries(headers).forEach(([key, value])=>{
        const keyElement=document.createElement('div');
        const valueElement=document.createElement('div');

        keyElement.textContent=key;
        responseHeadersContainer.append(keyElement);

        valueElement.textContent=value;
        responseHeadersContainer.append(valueElement);
    });
};


function updateResponseDetails(response) {
    document.querySelector('[data-status]').innerHTML='';
    document.querySelector('[data-status]').textContent=response.status;
    document.querySelector('[data-size]').textContent=prettyBytes(JSON.stringify(response.data).length+JSON.stringify(response.headers).length);
};

// USE INTERCEPTORS TO CALCULATE THE TIME TAKEN TO PROCESS THE API REQUEST.