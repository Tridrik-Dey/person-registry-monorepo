package it.bars.person_registry.repositories;

import it.bars.person_registry.entities.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    @Query("SELECT a FROM Address a " +
            "WHERE LOWER(a.street) = LOWER(:street) " +
            "AND a.number = :number " +
            "AND LOWER(a.city) = LOWER(:city) " +
            "AND LOWER(a.province) = LOWER(:province) " +
            "AND LOWER(a.country) = LOWER(:country)")
    Optional<Address> findExistingAddress(
            @Param("street") String street,
            @Param("number") int number,
            @Param("city") String city,
            @Param("province") String province,
            @Param("country") String country
    );
}
