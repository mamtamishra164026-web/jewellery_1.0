package com.ecommerce.project;

import com.ecommerce.project.model.User;
import com.ecommerce.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class EcommerceApplication implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${DEFAULT_ADMIN_USERNAME:admin}")
    private String defaultAdminUsername;

    @Value("${DEFAULT_ADMIN_PASSWORD:admin123}")
    private String defaultAdminPassword;

    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        // Enforce safe database initialization check for primary default Admin account
        if (userRepository.findByUsername(defaultAdminUsername).isEmpty()) {
            User admin = new User(
                    defaultAdminUsername,
                    "admin@creationhub.com",
                    passwordEncoder.encode(defaultAdminPassword),
                    "ROLE_ADMIN"
            );
            userRepository.save(admin);
            System.out.println("=================================================");
            System.out.println("SETUP ENGINE: Created Default Admin '" + defaultAdminUsername + "'!");
            System.out.println("=================================================");
        }

        userRepository.findByUsername("shiva").ifPresent(user -> {
            user.setPassword(passwordEncoder.encode("112233"));
            userRepository.save(user);
            System.out.println("=================================================");
            System.out.println("SUCCESS: Password for user 'shiva' updated to '112233'!");
            System.out.println("=================================================");
        });
    }
}
