package it.bars.person_registry.payloads;

import it.bars.person_registry.entities.Address;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;


public record PersonDTO(

        @NotBlank(message = "Tax code is required!")
        @Pattern(
                regexp = "^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$",
                message = "Invalid tax code format!"
        )
        String taxCode,

        @NotBlank(message = "Name is required!")
        @Size(min = 2, max = 40, message = "Name must be between 2 and 40 characters!")
        String name,

        @NotBlank(message = "Surname is required!")
        @Size(min = 2, max = 40, message = "Surname must be between 2 and 40 characters!")
        String surname,

        @NotNull(message = "Address is required!")
        @Valid
        Address address
) {
}
