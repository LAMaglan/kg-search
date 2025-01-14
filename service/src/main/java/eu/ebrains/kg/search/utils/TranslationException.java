package eu.ebrains.kg.search.utils;

import lombok.Getter;

@Getter
public class TranslationException extends Exception{

    private final String identifier;

    public TranslationException(String message, String identifier) {
        super(message);
        this.identifier = identifier;
    }

}
