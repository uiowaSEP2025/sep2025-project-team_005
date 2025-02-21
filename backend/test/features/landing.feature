Feature: Landing Page Navigation

    Scenario: Navigate to login page from the landing page
        Given I am on the Savvy Note landing page 
        And I have not logged into a Savvy Note account
        When I click the Login button
        Then I am redirected to the login page

    Scenario: Navigate to signup page from the landing page
        Given I am on the Savvy Note landing page 
        And I have not created a Savvy Note account
        When I click the Get Started button
        Then I am redirected to the signup page