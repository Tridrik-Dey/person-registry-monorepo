package it.bars.person_registry.payloads;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressDTO(
        @NotBlank(message = "Street is required!")
        @Size(min = 2, max = 100, message = "Street must be between 2 and 100 characters!")
        String street,

        @Min(value = 1, message = "Number must be greater than 0")
        int number,

        @NotBlank(message = "City is required!")
        @Size(min = 2, max = 60, message = "City must be between 2 and 60 characters!")
        String city,

        @NotBlank(message = "Province is required!")
        @Size(min = 2, max = 40, message = "Province must be between 2 and 40 characters!")
        String province,

        @NotBlank(message = "Country is required!")
        @Size(min = 2, max = 60, message = "Country must be between 2 and 60 characters!")
        String country
) {
}
