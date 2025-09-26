# Person Registry (Anagrafica Persona)

A full-stack CRUD application for managing persons and their addresses.  
Un'applicazione full-stack CRUD per la gestione delle persone e dei loro indirizzi.  

- **Backend**: Spring Boot (Java 17), REST API, MySQL, Lombok  
- **Frontend**: React (CRA), React Query, i18n, Axios  
- **Database**: MySQL (locale, Docker o esterno)  

---

## Features / Funzionalità

- Create, read, update, and delete persons with address information  
- Creazione, lettura, aggiornamento e cancellazione di persone con informazioni sull'indirizzo  

- Search by **Codice Fiscale**  
- Ricerca tramite **Codice Fiscale**  

- Advanced filters by **Surname** and **Province**  
- Filtri avanzati per **Cognome** e **Provincia**  

- Validations on Codice Fiscale and address fields  
- Validazioni sul Codice Fiscale e sui campi dell'indirizzo  

- Italian/English DTO mapping (configurable via env)  
- Mappatura DTO italiano/inglese (configurabile tramite variabili d'ambiente)  

- Local dev with CORS support  
- Sviluppo locale con supporto CORS  

---

## Prerequisites / Prerequisiti

- **Java 17+**  
- **Node.js 16+**  
- **MySQL 8+**  

---

## Getting Started (Local Development)  
## Avvio (Sviluppo Locale)

### Backend
1. Configure your database in `src/main/resources/application.yml`:  
   Configura il tuo database in `src/main/resources/application.yml`:  

   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/person_registry
       username: user
       password: PersonReg123!
       driver-class-name: com.mysql.cj.jdbc.Driver
   ```

2. Run the backend:  
   Avvia il backend:  
   ```bash
   ./mvnw spring-boot:run
   ```
   API available at: [http://localhost:8080](http://localhost:8080)  
   API disponibile su: [http://localhost:8080](http://localhost:8080)  

### Frontend
1. Go to the frontend folder:  
   Vai nella cartella del frontend:  
   ```bash
   cd person-registry-ui-main
   ```

2. Set environment variables in `.env.development`:  
   Imposta le variabili d'ambiente in `.env.development`:  
   ```env
   REACT_APP_API_BASE=http://localhost:8080
   REACT_APP_API_DTO=en
   ```

3. Start the frontend:  
   Avvia il frontend:  
   ```bash
   npm install
   npm start
   ```
   App available at: [http://localhost:3000](http://localhost:3000)  
   Applicazione disponibile su: [http://localhost:3000](http://localhost:3000)  

---

## Database Schema / Schema del Database

```sql
CREATE TABLE pr_address (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  street VARCHAR(255),
  number INT,
  city VARCHAR(100),
  province VARCHAR(10),
  country VARCHAR(100)
);

CREATE TABLE pr_person (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  surname VARCHAR(100),
  tax_code VARCHAR(16) UNIQUE NOT NULL,
  address_id BIGINT,
  CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES pr_address(id)
);
```

Sample record / Esempio di record:
```sql
INSERT INTO pr_address (street, number, city, province, country)
VALUES ('Via Roma', 10, 'Milano', 'MI', 'Italia');

INSERT INTO pr_person (name, surname, tax_code, address_id)
VALUES ('Mario', 'Rossi', 'RSSMRA85T10A562S', 1);
```

---

## API Endpoints / Endpoint API

### 1. Get person by Codice Fiscale  
Ottenere persona tramite Codice Fiscale
```http
GET /persons/{cf}
```

### 2. Search persons (advanced filters)  
Ricerca persone (filtri avanzati)
```http
GET /persons/search?lastName={surname}&province={province}
```

- `lastName` → partial surname (≥ 2 chars)  
- `lastName` → cognome parziale (≥ 2 caratteri)  

- `province` → 2-letter province code (e.g., MI)  
- `province` → codice provincia a 2 lettere (es. MI)  

---

### 3. Create a new person / Creare una nuova persona
```http
POST /persons
Content-Type: application/json
```

### 4. Update an existing person / Aggiornare una persona esistente
```http
PUT /persons/{cf}
Content-Type: application/json
```

### 5. Delete a person / Eliminare una persona
```http
DELETE /persons/{cf}
```

---

## Environment Variables / Variabili d’Ambiente

- `REACT_APP_API_BASE` → API base URL (es. `http://localhost:8080`).  
- `REACT_APP_API_DTO` → Stile DTO: `en` o `it`.  
- `REACT_APP_LOG_LEVEL` → livello log (`info`, `debug`).  

---

## Usage Notes / Note d’Uso

- Search requires exact **Codice Fiscale** (16 chars).  
- La ricerca richiede un **Codice Fiscale** esatto (16 caratteri).  

- Advanced filters need **≥ 2 characters** for surname or **exactly 2 letters** for province.  
- I filtri avanzati richiedono **≥ 2 caratteri** per il cognome o **esattamente 2 lettere** per la provincia.  

- Codice Fiscale is immutable after creation.  
- Il Codice Fiscale non è modificabile dopo la creazione.  

---

## Documentation / Documentazione

A **project workflow PDF document** is included, which explains how the system works step by step with annotated screenshots.  
È incluso un **documento PDF sul flusso del progetto**, che spiega passo passo come funziona il sistema con schermate annotate.  

---

## License / Licenza

© BARSystems ([https://www.barsystems.it/](https://www.barsystems.it/))  
All rights reserved. This software is proprietary and intended for internal use within BARSystems. Redistribution or modification outside the organization requires prior written consent.  
Tutti i diritti riservati. Questo software è proprietario ed è destinato all'uso interno all'interno di BARSystems. La ridistribuzione o la modifica al di fuori dell'organizzazione richiede il consenso scritto preventivo.
- `backend/` — Spring Boot (Java 17+, Maven)
- `frontend/` — React (CRA, Node.js)
```bash
cd backend
mvn spring-boot:run
```bash
cd backend
mvn spring-boot:run
.github/workflows/ci.yml
