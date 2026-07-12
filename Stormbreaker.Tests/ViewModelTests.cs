using Xunit;
using Stormbreaker.ViewModels;
using Stormbreaker.Services;
using Stormbreaker.Views;

namespace Stormbreaker.Tests
{
    public class ViewModelTests
    {
        [Fact]
        public void TestLanguageSwitching()
        {
            // Arrange
            var vm = new MainViewModel();

            // Act - Switch to Spanish
            vm.SelectedLanguage = "es";
            var dashboardTitleEs = vm.Txt["Dashboard"];

            // Act - Switch to English
            vm.SelectedLanguage = "en";
            var dashboardTitleEn = vm.Txt["Dashboard"];

            // Assert
            Assert.Equal("en", vm.Txt.Language);
            Assert.Equal("Panel Principal", dashboardTitleEs);
            Assert.Equal("Dashboard", dashboardTitleEn);
        }

        [Fact]
        public void TestDemoModeToggle()
        {
            // Arrange
            var vm = new MainViewModel();

            // Assert default: Demo mode enabled
            Assert.True(vm.IsDemoMode);
            Assert.NotEmpty(vm.Events);
            Assert.Equal("MUN-2026-0417", vm.Case.Id);

            // Act - Switch to Production Mode (Demo off)
            vm.IsDemoMode = false;

            // Assert - State is empty / clean for production
            Assert.False(vm.IsDemoMode);
            Assert.Empty(vm.Events);
            Assert.Equal("MUN-EMPTY-CASE", vm.Case.Id);

            // Act - Re-enable Demo Mode
            vm.IsDemoMode = true;

            // Assert - State is restored
            Assert.NotEmpty(vm.Events);
            Assert.Equal("MUN-2026-0417", vm.Case.Id);
        }

        [Fact]
        public void TestCustomCaseImport()
        {
            // Arrange
            var service = new SampleDataService();
            var customData = new CustomCaseData
            {
                Case = new Models.CaseInfo
                {
                    Id = "TEST-ID-999",
                    Host = "HOST-999",
                    Analyst = "Tester",
                    Os = "Linux",
                    Acquired = "Now",
                    Tool = "TestTool"
                },
                Events = new List<Models.EventLogItem>
                {
                    new Models.EventLogItem { Ts = "12:00:00", Id = 100, Msg = "Test Event" }
                }
            };

            // Act
            service.LoadCustomCase(customData);

            // Assert
            Assert.Equal("TEST-ID-999", service.Case.Id);
            Assert.Single(service.Events);
            Assert.Equal("Test Event", service.Events[0].Msg);
        }
    }
}
