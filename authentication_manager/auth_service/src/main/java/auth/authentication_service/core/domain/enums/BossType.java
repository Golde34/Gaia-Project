package auth.authentication_service.core.domain.enums;

public enum BossType {
   BOSS("SIGNIN_BY_GAIA", "ROLE_BOSS", "Use when gaia automatically sign in by boss command"),
   USER("SIGNIN_BY_CLIENT_DEVICE", "ROLE_USER", "Use when user sign in in website");

    private String value;
    private String role;
    private String description;

    BossType(String value) {
        this.value = value;
    }

    BossType(String value, String role, String description) {
        this.value = value;
        this.role = role;
        this.description = description;
    }

    public String getValue() { return value; }

    public String getDescription() { return description; }

    public String getRole() { return role; }
}
