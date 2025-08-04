# Twilio Serverless Templates
## 💡 Visão Geral
Conjunto de templates para funções serverless da Twilio, com o objetivo de padronizar e agilizar o desenvolvimento de novos serviços de forma consistente e reutilizável.

## 🔐 Validação de Token

Verifica se um token JWT fornecido no cabeçalho `Authorization` é válido, utilizando o validador da Twilio.

```ts
await validateToken({ authorization, accountSid, accountToken })
````

**Parâmetros:**

* **authorization**: string contendo o token JWT
* **accountSid**: SID da conta Twilio
* **accountToken**: token da conta Twilio

**Retorna um erro** se o token estiver ausente ou inválido.

---

## 🔑 Validação de Chave de API

Compara a chave fornecida pelo cliente com uma chave armazenada no ambiente.

```ts
validateApiKey({ requestKey, secretKey })
```

**Parâmetros:**

* **requestKey**: chave fornecida pelo cliente, normalmente no cabeçalho `X-API-KEY`
* **secretKey**: chave secreta configurada no ambiente

**Retorna um erro** se a chave estiver ausente ou não for correspondente.

---

## 📋 Validação de Esquema

Verifica se os dados recebidos no `event` seguem um esquema definido de tipos e obrigatoriedades.

```ts
const result = validateSchema(schema, event)
```

**Exemplo de esquema:**

```ts
{
  nome: { type: 'string', required: true },
  idade: { type: 'number', required: false },
  ativo: { type: 'boolean', required: true }
}
```

**Retorno:**

* **isValid**: `true` se todos os campos estiverem corretos
* **data**: dados filtrados e convertidos
* **errors**: array de mensagens de erro, caso existam

---

## ✅ Criadores de Respostas

Funções auxiliares para padronizar as respostas da função.

### `createResponse()`

Cria uma nova instância de `Twilio.Response` com cabeçalhos **CORS** e `Content-Type` definidos.

### `createErrorResponse({ error, message, code })`

Cria uma nova instância de `Twilio.Response` contendo um objeto de erro, uma mensagem e *status code* opcional.

**Parâmetros:**

* **error**: objeto de erro ou detalhes
* **message**: mensagem amigável de erro
* **code**: status HTTP (padrão: 500)
---

## 📚 Documentação Relevante

* [📘 Conceitos gerais de Functions e Assets (Twilio)](https://www.twilio.com/docs/serverless/functions-assets/functions)
* [🧪 Twilio Serverless Toolkit (CLI)](https://www.twilio.com/docs/labs/serverless-toolkit)
* [⚙️ Uso com TypeScript](https://www.twilio.com/docs/labs/serverless-toolkit/guides/typescript)
* [📂 Configuração de múltiplos arquivos `.env`](https://www.twilio.com/docs/labs/serverless-toolkit/configuration#scoped-configurations)
* [🔐 Validador de Token do Flex (npm)](https://www.npmjs.com/package/twilio-flex-token-validator)

---
> Gerado com ChatGPT • Documentação das Funções Twilio Serverless