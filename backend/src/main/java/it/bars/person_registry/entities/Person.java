package it.bars.person_registry.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "pr_person")
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tax_code", unique = true, nullable = false, length = 16)
    private String taxCode; // unique constraint


    @Column(name = "name", nullable = false, length = 50)
    private String name;


    @Column(name = "surname", nullable = false, length = 50)
    private String surname;

    @ManyToOne
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTaxCode() {
        return taxCode;
    }

    public void setTaxCode(String taxCode) {
        this.taxCode = taxCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    @Override
    public String toString() {
        return "Person{" +
                "id=" + id +
                ", taxCode='" + taxCode + '\'' +
                ", firstName='" + name + '\'' +
                ", surname='" + surname + '\'' +
                ", addressId=" + address.getId() +
                '}';
    }
}
