package it.bars.person_registry.services;

import it.bars.person_registry.entities.Address;
import it.bars.person_registry.entities.Person;
import it.bars.person_registry.exceptions.BadRequestException;
import it.bars.person_registry.exceptions.NotFoundException;
import it.bars.person_registry.payloads.PersonDTO;
import it.bars.person_registry.repositories.AddressRepository;
import it.bars.person_registry.repositories.PersonRepository;
import it.bars.person_registry.security.MessageManager;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class PersonService {

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private MessageManager messages;

    @PostConstruct
    public void init() {

    }

    public Person savePerson(PersonDTO personDTO) {
        log.info(messages.get("person.creation.started", new Object[]{personDTO.taxCode()}));

        this.personRepository.findByTaxCode(personDTO.taxCode())
                .ifPresent(person -> {
                    log.warn(messages.get("person.already.exists", new Object[]{personDTO.taxCode()}));
                    throw new BadRequestException("Person with tax code " + personDTO.taxCode() + " already exists!");
                });

        Address address = personDTO.address();
        log.debug(messages.get("address.processing.started", new Object[]{address.getStreet() + ", " + address.getCity()}));

        Address addressToUse = this.addressRepository.findExistingAddress(
                address.getStreet(),
                address.getNumber(),
                address.getCity(),
                address.getProvince(),
                address.getCountry()
        ).orElseGet(() -> {
            log.debug(messages.get("address.new.saving", new Object[]{address.getStreet() + ", " + address.getCity()}));
            return this.addressRepository.save(address);
        });

        Person person = new Person();
        person.setTaxCode(personDTO.taxCode());
        person.setName(personDTO.name());
        person.setSurname(personDTO.surname());
        person.setAddress(addressToUse);

        Person savedPerson = this.personRepository.save(person);
        log.info(messages.get("person.created.success", new Object[]{savedPerson.getTaxCode()}));

        return savedPerson;
    }

    public Page<Person> findAll(int page, int size, String sortBy) {
        log.debug(messages.get("person.search.started", new Object[]{"page: " + page + ", size: " + size + ", sort: " + sortBy}));

        if (size > 100) {
            log.warn(messages.get("pagination.size.limited", new Object[]{size, 100}));
            size = 100;
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Person> result = this.personRepository.findAll(pageable);

        log.info(messages.get("person.list.retrieved.success", new Object[]{result.getTotalElements()}));
        return result;
    }

    public Person findByTaxCode(String taxCode) {
        log.debug(messages.get("person.search.by.taxcode.started", new Object[]{taxCode}));

        Person person = this.personRepository.findByTaxCode(taxCode)
                .orElseThrow(() -> {
                    log.warn(messages.get("person.not.found", new Object[]{taxCode}));
                    return new NotFoundException("Person with tax code " + taxCode + " not found!");
                });

        log.info(messages.get("person.found.success", new Object[]{taxCode}));
        return person;
    }

    public Person updatePerson(String taxCode, PersonDTO personDTO) {
        log.info(messages.get("person.update.started", new Object[]{taxCode}));

        Person person = findByTaxCode(taxCode);

        Address address = personDTO.address();
        log.debug(messages.get("address.processing.started", new Object[]{address.getStreet() + ", " + address.getCity()}));

        Address addressToUse = this.addressRepository.findExistingAddress(
                address.getStreet(),
                address.getNumber(),
                address.getCity(),
                address.getProvince(),
                address.getCountry()
        ).orElseGet(() -> {
            log.debug(messages.get("address.new.saving", new Object[]{address.getStreet() + ", " + address.getCity()}));
            return this.addressRepository.save(address);
        });

        person.setName(personDTO.name());
        person.setSurname(personDTO.surname());
        person.setAddress(addressToUse);

        Person updatedPerson = this.personRepository.save(person);
        log.info(messages.get("person.updated.success", new Object[]{taxCode}));
        return updatedPerson;
    }

    public void deletePerson(String taxCode) {
        log.info(messages.get("person.delete.started", new Object[]{taxCode}));

        Person person = findByTaxCode(taxCode);
        this.personRepository.delete(person);

        log.info(messages.get("person.deleted.success", new Object[]{taxCode}));
    }

    public List<Person> search(String surname, String province) {
        log.debug(messages.get("person.search.filters.started", new Object[]{"surname: " + surname + ", province: " + province}));

        List<Person> results = this.personRepository.searchByFilters(surname, province);

        log.info(messages.get("person.search.filters.completed", new Object[]{results.size(), surname, province}));
        return results;
    }
}
