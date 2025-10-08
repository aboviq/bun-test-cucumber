Feature: With Data

  Scenario: With Data Scenario
    When I have a table:
      | Header 1 | Header 2 | Header 3 |
      | Value 1  | Value 2  | Value 3  |
      | Value A  | Value B  | Value C  |
    Then I have data
