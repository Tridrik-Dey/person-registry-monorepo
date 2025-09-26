package it.bars.person_registry.security;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Helper to simplify accessing i18n messages in code.
 * <p>
 * This finds messages automatically found from src/main/resources (files named messages_*.properties)
 * <p>
 * This class uses English locale as default.
 */
@Component
public class MessageManager {

    private static final Locale LOCALE_DEFAULT = Locale.ENGLISH;

    @Value("${integration-service.config.country}")
    private String country;// Country (IT, EN)

    @Autowired
    private MessageSource messageSource;

    private MessageSourceAccessor accessor;

    @PostConstruct
    private void init() {
        Locale locale = LOCALE_DEFAULT;
        if (country.equals("IT")) {
            locale = Locale.ITALIAN;
        }
        accessor = new MessageSourceAccessor(messageSource, locale);
    }

    public String get(String code) {
        return accessor.getMessage(code);
    }

    public String get(String code, Object[] args) {
        return accessor.getMessage(code, args);
    }

}