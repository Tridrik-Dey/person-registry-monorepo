package it.bars.person_registry.repositories;

import it.bars.person_registry.entities.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {

    // Ricerca per tax code
    Optional<Person> findByTaxCode(String taxCode);

    // Ricerca per filtri (surname e province)
    @Query("SELECT p FROM Person p " +
            "WHERE (:surname IS NULL OR LOWER(p.surname) LIKE LOWER(CONCAT('%', :surname, '%'))) " +
            "AND (:province IS NULL OR LOWER(p.address.province) = LOWER(:province))")
    List<Person> searchByFilters(@Param("surname") String surname,
                                 @Param("province") String province);
}
