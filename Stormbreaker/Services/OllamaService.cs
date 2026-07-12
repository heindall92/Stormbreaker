using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Stormbreaker.Services
{
    public class OllamaService
    {
        private readonly HttpClient _httpClient;
        public string Endpoint { get; set; } = "http://localhost:11434";
        public string Model { get; set; } = "llama3.1:8b";
        public List<string> InstalledModels { get; private set; } = new List<string>();
        public bool IsConnected { get; private set; }

        public OllamaService()
        {
            _httpClient = new HttpClient();
        }

        private string GetNormalizedEndpoint()
        {
            return Endpoint.TrimEnd('/');
        }

        public async Task<bool> TestConnectionAsync(int timeoutMs = 2000)
        {
            try
            {
                using var cts = new CancellationTokenSource(timeoutMs);
                var url = $"{GetNormalizedEndpoint()}/api/tags";
                var response = await _httpClient.GetAsync(url, cts.Token);
                if (!response.IsSuccessStatusCode)
                {
                    IsConnected = false;
                    return false;
                }

                var json = await response.Content.ReadAsStringAsync(cts.Token);
                using var doc = JsonDocument.Parse(json);
                var modelsList = new List<string>();
                if (doc.RootElement.TryGetProperty("models", out var modelsProp) && modelsProp.ValueKind == JsonValueKind.Array)
                {
                    foreach (var mElement in modelsProp.EnumerateArray())
                    {
                        if (mElement.TryGetProperty("name", out var nameProp))
                        {
                            modelsList.Add(nameProp.GetString() ?? string.Empty);
                        }
                    }
                }

                InstalledModels = modelsList;
                IsConnected = true;
                return true;
            }
            catch
            {
                IsConnected = false;
                return false;
            }
        }

        public async Task StreamChatAsync(string systemPrompt, string userPrompt, Action<string> onTokenReceived, CancellationToken cancellationToken)
        {
            var url = $"{GetNormalizedEndpoint()}/api/chat";

            var requestBody = new
            {
                model = Model,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt }
                },
                stream = true,
                options = new { temperature = 0.2 }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            // Use ResponseHeadersRead to process the HTTP response as it streams in
            using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            response.EnsureSuccessStatusCode();

            using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var reader = new StreamReader(stream, Encoding.UTF8);

            while (!reader.EndOfStream)
            {
                cancellationToken.ThrowIfCancellationRequested();
                var line = await reader.ReadLineAsync(cancellationToken);
                if (string.IsNullOrWhiteSpace(line)) continue;

                try
                {
                    using var responseJson = JsonDocument.Parse(line);
                    if (responseJson.RootElement.TryGetProperty("message", out var messageProp) &&
                        messageProp.TryGetProperty("content", out var contentProp))
                    {
                        var content = contentProp.GetString();
                        if (!string.IsNullOrEmpty(content))
                        {
                            onTokenReceived(content);
                        }
                    }
                }
                catch
                {
                    // Ignore malformed json lines in the stream
                }
            }
        }
    }
}
