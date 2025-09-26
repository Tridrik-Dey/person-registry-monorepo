package it.bars.person_registry.controllers;

import it.bars.person_registry.entities.Person;
import it.bars.person_registry.exceptions.BadRequestException;
import it.bars.person_registry.payloads.PersonDTO;
import it.bars.person_registry.security.MessageManager;
import it.bars.person_registry.services.PersonService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/persons")
@Slf4j
public class PersonController {

    private final PersonService personService;

    @Autowired
    private MessageManager messages;

    @Autowired
    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Person createPerson(@RequestBody @Validated PersonDTO personDTO, BindingResult validationResult) {
        if (validationResult.hasErrors()) {
            String message = validationResult.getAllErrors()
                    .stream()
                    .map(objectError -> objectError.getDefaultMessage())
                    .collect(Collectors.joining(". "));
            log.warn(messages.get("request.validation.failed", new Object[]{message}));
            throw new BadRequestException("There are errors in the payload! " + message);
        }

        log.info(messages.get("request.create.person.started", new Object[]{personDTO.taxCode()}));
        Person createdPerson = this.personService.savePerson(personDTO);
        log.info(messages.get("request.create.person.success", new Object[]{createdPerson.getTaxCode()}));

        return createdPerson;
    }

    @GetMapping
    public Page<Person> getAllPersons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "taxCode") String sortBy
    ) {
        log.info(messages.get("request.get.all.persons.started", new Object[]{page, size, sortBy}));
        Page<Person> result = this.personService.findAll(page, size, sortBy);
        log.info(messages.get("request.get.all.persons.success", new Object[]{result.getTotalElements(), result.getNumberOfElements()}));
        return result;
    }

    @GetMapping("/{taxCode}")
    public Person getPersonByTaxCode(@PathVariable String taxCode) {
        log.info(messages.get("request.get.person.by.taxcode.started", new Object[]{taxCode}));
        Person person = this.personService.findByTaxCode(taxCode);
        log.info(messages.get("request.get.person.by.taxcode.success", new Object[]{taxCode}));
        return person;
    }

    @PutMapping("/{taxCode}")
    public Person updatePerson(
            @PathVariable String taxCode,
            @RequestBody @Validated PersonDTO personDTO,
            BindingResult validationResult
    ) {
        if (validationResult.hasErrors()) {
            String message = validationResult.getAllErrors()
                    .stream()
                    .map(objectError -> objectError.getDefaultMessage())
                    .collect(Collectors.joining(". "));
            log.warn(messages.get("request.validation.failed", new Object[]{message}));
            throw new BadRequestException("There are errors in the payload! " + message);
        }

        log.info(messages.get("request.update.person.started", new Object[]{taxCode}));
        Person updatedPerson = this.personService.updatePerson(taxCode, personDTO);
        log.info(messages.get("request.update.person.success", new Object[]{taxCode}));
        return updatedPerson;
    }

    @DeleteMapping("/{taxCode}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePerson(@PathVariable String taxCode) {
        log.info(messages.get("request.delete.person.started", new Object[]{taxCode}));
        this.personService.deletePerson(taxCode);
        log.info(messages.get("request.delete.person.success", new Object[]{taxCode}));
    }

    @GetMapping("/search")
    public List<Person> searchPersons(
            @RequestParam(required = false) String surname,
            @RequestParam(required = false) String province
    ) {
        log.info(messages.get("request.search.persons.started", new Object[]{surname, province}));
        List<Person> results = this.personService.search(surname, province);
        log.info(messages.get("request.search.persons.success", new Object[]{results.size(), surname, province}));
        return results;
    }
}
